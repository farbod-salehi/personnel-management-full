using API.Helpers;
using Entities;
using Entities.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Repository;


var builder = WebApplication.CreateBuilder(args);

IWebHostEnvironment environment = builder.Environment;

string connectionString = environment.IsDevelopment() ?
                Constances.DevelopmentConnectionString :
                Constances.ProductionConnectionString;

string uploadsFolderPath = Path.Combine(environment.ContentRootPath, "Uploads");

#region Services

builder.Services.AddDbContext<RepositoryContext>(options =>
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("API").EnableRetryOnFailure()));

//In Minimal APIs, authentication is handled using the IAuthenticationService rather than AuthenticationManager
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = Constances.JWTSettings.Issuer;
        options.Audience = Constances.JWTSettings.Audience;
    });

builder.Services.AddAuthorization();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
});


// To validate a username and password using UserManager<IdentityUser> from ASP.NET Core Identity
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<RepositoryContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORSPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true).
                            AllowAnyMethod().
                            AllowAnyHeader().
                            AllowCredentials();
    });
});

// To access HttpContext
builder.Services.AddHttpContextAccessor();

// Add anti-forgery services
builder.Services.AddAntiforgery();

//These will be created once per request and shared within that request lifecycle.
builder.Services.AddScoped<RepositoryManager>();
builder.Services.AddScoped<TokenManager>();
builder.Services.AddScoped<SignInManager<User>>();
builder.Services.AddSingleton<ILookupNormalizer, UpperInvariantLookupNormalizer>();

#endregion Services

var app = builder.Build();

#region  Configuration of HTTP request pipeline

app.UseCors("CORSPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

// Enable serving static files from the Uploads folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsFolderPath),
    RequestPath = "/Uploads"
});

// Custom exception handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            Error = "خطایی در سمت سرور اتفاق افتاده است.",
            Details = ex.Message
        });
    }
});

#endregion Configuration of HTTP request pipeline

#region My Account Endpoints


app.MapPost("/api/login", async ([FromServices] UserManager<User> userManager, [FromServices] RepositoryManager repositoryManager, [FromServices] SignInManager<User> signInManager, [FromBody] LoginRequest request) =>
{
    var user = await userManager.FindByNameAsync(request.Username);

    if (user == null)
    {
        return Results.Json(new { Error = "نام کاربری یا کلمه عبور اشتباه است" }, statusCode: 401);
    }

    MyUtility utility = new();

    if (user.PasswordHash != utility.ComputeSha256Hash(request.Password))
    {
        return Results.Json(new { Error = "نام کاربری یا کلمه عبور اشتباه است" }, statusCode: 401);
    }

    if (user.Active == false)
    {
        return Results.UnprocessableEntity(new { Error = "این حساب کاربری غیرفعال است." });
    }

    TokenManager tokenManager = new();

    string token = tokenManager.GenerateJWTToken(user);

    string hashedToken = utility.ComputeSha256Hash(token);

    var userToken = new UserToken
    {
        ExpiredAt = DateTime.UtcNow.AddDays(Constances.JWTSettings.ValidDays),
        HashedToken = hashedToken,
        UserId = user.Id,
    };

    repositoryManager.UserToken.Create(userToken);

    await repositoryManager.SaveAsync();

    return Results.Ok(new { UserTitle = user.Title, UserRole = user.Role, UserToken = token });
});

app.MapPost("/api/signout", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] TokenManager tokenManager, [FromServices] RepositoryManager repositoryManager, [FromServices] SignInManager<User> signInManager) => {

    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess)
    {
        string token = tokenManager.GetJWTToken(httpContextAccessor.HttpContext!.Request);

        string hashedToken = utility.ComputeSha256Hash(token);

        UserToken? userToken = await repositoryManager.UserToken.GetByToken(true, hashedToken);

        if (userToken != null)
        {
            repositoryManager.UserToken.Delete(userToken);

            await repositoryManager.SaveAsync();
        }
    }

    return Results.NoContent();
});

app.MapPatch("/api/changepassword", async ([FromServices] UserManager<User> userManager, [FromServices] TokenManager tokenManager, [FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromBody] ChangeMyPasswordRequest request) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if (string.IsNullOrWhiteSpace(request.NewPassword) ||
        string.IsNullOrWhiteSpace(request.ConfirmPassword) ||
        string.IsNullOrWhiteSpace(request.CurrentPassword))
    {
        return Results.BadRequest(new { Error = "همه اطلاعات مورد نیاز را وارد نمایید." });
    }

    if (request.NewPassword != request.ConfirmPassword)
        return Results.BadRequest(new { Error = "کلمه عبور جدید و تکرار آن باید یکسان باشند." });

    if (request.NewPassword.Length < Constances.UserPasswordMinLength)
        return Results.BadRequest(new { Error = "طول کلمه عبور جدید صحیح نمی‌باشد." });

    string? userId = tokenManager.GetUserIdFromTokenClaims(httpContextAccessor.HttpContext!);

    User? user = await repositoryManager.User.GetById(true, userId!);

    if (user == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    if (user.PasswordHash != utility.ComputeSha256Hash(request.CurrentPassword))
    {
        return Results.BadRequest(new { Error = "کلمه عبور فعلی صحیح نمی‌باشد." });
    }

    user.PasswordChangedAt = DateTime.UtcNow;
    user.PasswordHash = utility.ComputeSha256Hash(request.NewPassword);

    await repositoryManager.SaveAsync();


    return Results.NoContent();

});

#endregion  My Account Endpoints

#region InitInfo Endpoints

app.MapGet("/api/initinfo/{type:int?}", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromRoute]int? type = null) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin, (int)Constances.UserRole.manager]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }
    
    List<InitInfo> list = await repositoryManager.InitInfo.GetAll(false, type);

    return Results.Ok(new
    {
        list = list.Select(x => new
        {
            x.Id,           
            x.Title,
            x.Type,
            x.ParentId,
            x.Active,
            CreatedAt = new PersianDateTime((DateTime)x.CreatedAt)
        }),
       
    });
});

app.MapGet("/api/initinfo/{type}/{id}", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromRoute] Guid id, [FromRoute]int type) => 
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin, (int)Constances.UserRole.manager]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    InitInfo? initInfo = await repositoryManager.InitInfo.GetById(false, type, id);

    if (initInfo == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    return Results.Ok(new
    {
        initInfo.Id,
        initInfo.Type,
        initInfo.Title,
        initInfo.ParentId,
        initInfo.Active
    });
});

app.MapPost("/api/initinfo/add", async([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromServices] TokenManager tokenManager, [FromBody] InitInfoAddRequest request) => {

    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin, (int)Constances.UserRole.manager]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if(string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { Error="عنوان را وارد کنید." });
    }

    InitInfo newInitInfo = new() { 
        Type = request.Type,
        ParentId = request.ParentId,
        Title = utility.CorrectArabicChars(request.Title)!,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = tokenManager.GetUserIdFromTokenClaims(httpContextAccessor.HttpContext!)!
    };

    repositoryManager.InitInfo.Create(newInitInfo);

    await repositoryManager.SaveAsync();

    return Results.Created($"/api/initinfo/{newInitInfo.Id}", new {});

});

app.MapPatch("/api/initinfo/{type}/{id}/update", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromServices] TokenManager tokenManager, [FromRoute] Guid id, [FromRoute] int type, [FromBody] InitInfoUpdateRequest request) => {

    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin, (int)Constances.UserRole.manager]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { Error = "همه اطلاعات مورد نیاز را وارد نمایید." });
    }

    InitInfo? initInfo = await repositoryManager.InitInfo.GetById(true, type, id);

    if (initInfo == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    initInfo.Title = utility.CorrectArabicChars(request.Title)!;
    initInfo.ParentId = request.ParentId;
    initInfo.Active = request.Active;

    await repositoryManager.SaveAsync();

    return Results.NoContent();
});

app.MapDelete("/api/initinfo/{id}/delete", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromServices] TokenManager tokenManager, [FromRoute] Guid id) => {

    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin, (int)Constances.UserRole.manager]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    InitInfo? initInfo = await repositoryManager.InitInfo.GetById(true, id);

    if (initInfo == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    initInfo.DeletedAt = DateTime.UtcNow;
    initInfo.DeletedBy = tokenManager.GetUserIdFromTokenClaims(httpContextAccessor.HttpContext!)!;

    await repositoryManager.SaveAsync();

    return Results.NoContent();
});

#endregion InitInfo Endpoints

#region Personnel Endpoints

app.MapGet("/api/personnel", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromQuery]string? searchQuery = null, [FromQuery]int page = 1, [FromQuery]int count = 10) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if(string.IsNullOrWhiteSpace(searchQuery) == false)
    {
        searchQuery = utility.CorrectArabicChars(searchQuery);
        searchQuery = utility.ConvertPersianNumbersToEnglish(searchQuery);
    }

    (List<Personnel> list, int pagesCount) = await repositoryManager.Personnel.GetList(false, searchQuery, page, count);
    

    return Results.Ok(new
    {
        list = list.Select(x => new
        {
            x.Id,
            x.FirstName,
            x.LastName,
            x.ShomarePersonneli,
            x.CodeMeli,           
            CreatedAt = new PersianDateTime((DateTime)x.CreatedAt)
        }),
        pagesCount
    });
});

app.MapGet("/api/personnel/{id}", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromRoute] Guid id) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    Personnel? personnel = await repositoryManager.Personnel.GetById(false, id);

    if (personnel == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    List<InitInfo> initInfoList = await repositoryManager.InitInfo.GetAll(false);

    return Results.Ok(new
    {
        Item = new
        {
            personnel.Id,
            personnel.CodeMeli,
            personnel.FirstName,
            personnel.LastName,
            personnel.ShomarePersonneli,
            personnel.TarikhAghazKhedmat,
            personnel.VahedKhedmat,
            personnel.IsMale,
            personnel.IsSetad,
            personnel.SayerSematha,
            personnel.EblaghDakheliAsliId,         
            personnel.ShahrMahalKhedmatId,
            personnel.MadrakTahsiliId,
            personnel.ReshteTahsiliId,
            personnel.PostId,
            personnel.ReshteShoghliId,
            personnel.MojtameGhazaiyId,
            personnel.NoeEstekhdamId,
            personnel.NoeMahalKhedmat,
        },
        EblaghDakheliList = initInfoList.Where(x=>x.Type == (int)Constances.InitInfoType.EblaghDakheliAsli && x.Active).Select(x=>new { x.Id, x.Title, x.ParentId }).ToList(),
        ShahrMahalKhedmatList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.ShahrMahalKhedmat && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        MadrakTahsiliList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.MadrakTahsili && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        ReshteTahsiliList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.ReshteTahsili && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        PostList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.Post && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        ReshteShoghliList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.ReshteShoghli && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        MojtameGhazaiyList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.MojtameGhazaiy && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        NoeEstekhdamList = initInfoList.Where(x => x.Type == (int)Constances.InitInfoType.NoeEstekhdam && x.Active).Select(x => new { x.Id, x.Title, x.ParentId }).ToList(),
        NoeMahalKhedmatList = Constances.NoeMahalKhematList
    });
});

app.MapPost("/api/personnel/add", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromServices] TokenManager tokenManager, [FromBody] PersonnelItemRequest request) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if (string.IsNullOrWhiteSpace(request.ShomarePersonneli) ||
        string.IsNullOrWhiteSpace(request.FirstName) ||
        string.IsNullOrWhiteSpace(request.LastName) ||
        request.EblaghDakheliAsliId == default ||
        request.ShahrMahalKhedmatId == default 
        )
    {
        return Results.BadRequest(new { Error = "همه اطلاعات مورد نیاز را وارد نمایید." });
    }

    var codeMeli = utility.ConvertPersianNumbersToEnglish(request.CodeMeli?.Trim());

    if (string.IsNullOrWhiteSpace(codeMeli) == false && codeMeli.Length != 10)
    {
        return Results.BadRequest(new { Error = "فرمت کد ملی صحیح نمی‌باشد." });
    }

    var shomarePersonneli = utility.ConvertPersianNumbersToEnglish(request.ShomarePersonneli)!;

    if (await repositoryManager.Personnel.DataIsDuplicate(shomarePersonneli, codeMeli))
    {
        return Results.UnprocessableEntity(new { Error = "شماره پرسنلی و کد ملی پرسنل باید منحصر به فرد باشند." });
    }


    Personnel newPersonnel = new()
    {
        CodeMeli = codeMeli,
        EblaghDakheliAsliId = request.EblaghDakheliAsliId,
        FirstName = utility.CorrectArabicChars(request.FirstName)!,
        LastName = utility.CorrectArabicChars(request.LastName)!,
        IsMale = request.IsMale,
        IsSetad = request.IsSetad,
        MadrakTahsiliId =  request.MadrakTahsiliId,
        ShahrMahalKhedmatId = request.ShahrMahalKhedmatId,
        MojtameGhazaiyId = request.MojtameGhazaiyId,
        NoeEstekhdamId = request.NoeEstekhdamId,
        PostId = request.PostId,
        ReshteShoghliId = request.ReshteShoghliId,
        ReshteTahsiliId = request.ReshteTahsiliId,
        SayerSematha = utility.CorrectArabicChars(request.SayerSematha),
        ShomarePersonneli = shomarePersonneli,
        TarikhAghazKhedmat = request.TarikhAghazKhedmat,
        VahedKhedmat = utility.CorrectArabicChars(request.VahedKhedmat)!,
        NoeMahalKhedmat = request.NoeMahalKhedmat,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = tokenManager.GetUserIdFromTokenClaims(httpContextAccessor.HttpContext!)!
    };


    repositoryManager.Personnel.Create(newPersonnel);

    await repositoryManager.SaveAsync();

    return Results.Created($"/api/personnel/{newPersonnel.Id}", new { });

});

app.MapPatch("/api/personnel/{id}/update", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromServices] TokenManager tokenManager, [FromRoute] Guid id, [FromBody] PersonnelItemRequest request) => {

    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if (string.IsNullOrWhiteSpace(request.ShomarePersonneli) ||
        string.IsNullOrWhiteSpace(request.FirstName) ||
        string.IsNullOrWhiteSpace(request.LastName) ||
        request.EblaghDakheliAsliId == default ||
        request.ShahrMahalKhedmatId == default 
        )
    {
        return Results.BadRequest(new { Error = "همه اطلاعات مورد نیاز را وارد نمایید." });
    }

    Personnel? personnel = await repositoryManager.Personnel.GetById(true, id);

    if (personnel == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    var codeMeli = utility.ConvertPersianNumbersToEnglish(request.CodeMeli?.Trim());

    if (string.IsNullOrWhiteSpace(codeMeli) == false && codeMeli.Length != 10)
    {
        return Results.BadRequest(new { Error = "فرمت کد ملی صحیح نمی‌باشد." });
    }

    var shomarePersonneli = utility.ConvertPersianNumbersToEnglish(request.ShomarePersonneli)!;

    if (await repositoryManager.Personnel.DataIsDuplicate(shomarePersonneli, codeMeli, id))
    {
        return Results.UnprocessableEntity(new { Error = "شماره پرسنلی و کد ملی پرسنل باید منحصر به فرد باشند." });
    }

    personnel.CodeMeli = codeMeli;
    personnel.EblaghDakheliAsliId = request.EblaghDakheliAsliId;
    personnel.FirstName = utility.CorrectArabicChars(request.FirstName)!;
    personnel.LastName = utility.CorrectArabicChars(request.LastName)!;
    personnel.IsMale = request.IsMale;
    personnel.IsSetad = request.IsSetad;
    personnel.MadrakTahsiliId = request.MadrakTahsiliId;
    personnel.ShahrMahalKhedmatId = request.ShahrMahalKhedmatId;
    personnel.MojtameGhazaiyId = request.MojtameGhazaiyId;
    personnel.NoeEstekhdamId = request.NoeEstekhdamId;
    personnel.PostId = request.PostId;
    personnel.ReshteShoghliId = request.ReshteShoghliId;
    personnel.ReshteTahsiliId = request.ReshteTahsiliId;
    personnel.SayerSematha = utility.CorrectArabicChars(request.SayerSematha)!;
    personnel.ShomarePersonneli = shomarePersonneli;
    personnel.TarikhAghazKhedmat = request.TarikhAghazKhedmat;
    personnel.VahedKhedmat = utility.CorrectArabicChars(request.VahedKhedmat)!;
    personnel.NoeMahalKhedmat = request.NoeMahalKhedmat;

    await repositoryManager.SaveAsync();

    return Results.NoContent();
});

app.MapDelete("/api/personnel/{id}/delete", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromServices] TokenManager tokenManager, [FromRoute] Guid id) => {

    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, null);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    Personnel? personnel = await repositoryManager.Personnel.GetById(true, id);

    if (personnel == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    personnel.DeletedAt = DateTime.UtcNow;
    personnel.DeletedBy = tokenManager.GetUserIdFromTokenClaims(httpContextAccessor.HttpContext!)!;

    await repositoryManager.SaveAsync();

    return Results.NoContent();
});

#endregion Personnel Endpoints

#region User Endpoints

app.MapPost("/api/users/add", async ([FromServices] UserManager<User> userManager, [FromServices] TokenManager tokenManager, [FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromBody] AddUserRequest request) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if (string.IsNullOrWhiteSpace(request.Username) ||
    string.IsNullOrWhiteSpace(request.Password) ||
    string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { Error = "همه اطلاعات مورد نیاز را وارد نمایید." });
    }

    if (request.Password.Length < Constances.UserPasswordMinLength)
        return Results.BadRequest(new { Error = "طول کلمه عبور صحیح نمی‌باشد." });

    if (request.Role != (int)Constances.UserRole.manager && request.Role != (int)Constances.UserRole.user)
        return Results.BadRequest(new { Error = "نقش کاربر به درستی مشخص نشده است." });

    string username = utility.CorrectArabicChars(request.Username.Trim())!;

    var user = await userManager.FindByNameAsync(username);

    if (user != null)
        return Results.UnprocessableEntity(new { Error = "این نام کاربری قبلا ثبت شده است" });


    var newUser = new User
    {
        Active = true,
        Title = utility.CorrectArabicChars(request.Title)!,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = tokenManager.GetUserIdFromTokenClaims(httpContextAccessor.HttpContext!),
        PasswordHash = utility.ComputeSha256Hash(request.Password),
        UserName = username,
        Role = request.Role
    };


    await userManager.CreateAsync(newUser);

    return Results.Created($"/api/users/{newUser.Id}", new { });

});

app.MapGet("/api/users", async ([FromServices] UserManager<User> userManager, [FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromQuery]string? searchQuery = null, [FromQuery] int page = 1, [FromQuery] int count = 10) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    (List<User> list, int pagesCount) = await repositoryManager.User.GetList(false, (int)Constances.UserRole.admin, searchQuery, page, count);

    return Results.Ok(new
    {
        list = list.Select(x => new
        {
            x.Id,
            x.UserName,
            x.Title,
            Role = (int)Constances.UserRole.user == x.Role ? "کاربر" : "مدیر"
        }).ToList(),
        pagesCount
    });
});

app.MapGet("/api/users/{id}", async ([FromServices] UserManager<User> userManager, [FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromRoute] string id) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    User? user = await repositoryManager.User.GetById(false, id);

    if (user == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    return Results.Ok(new { user.Role, user.Title, user.UserName });
});

app.MapPatch("/api/users/{id}/update", async ([FromServices] UserManager<User> userManager, [FromServices] TokenManager tokenManager, [FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager, [FromRoute] string id, [FromBody] UpdateUserRequest request) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { Error = "همه اطلاعات مورد نیاز را وارد نمایید." });
    }

    if (request.Password != null && request.Password.Length < Constances.UserPasswordMinLength)
        return Results.BadRequest(new { Error = "طول کلمه عبور صحیح نمی‌باشد." });

    if (request.Role != (int)Constances.UserRole.manager && request.Role != (int)Constances.UserRole.user)
        return Results.BadRequest(new { Error = "نقش کاربر به درستی مشخص نشده است." });

    User? user = await repositoryManager.User.GetById(true, id!, (int)Constances.UserRole.admin);

    if (user == null)
    {
        return Results.NotFound(new { Error = "داده موردنظر یافت نشد." });
    }

    user.Title = utility.CorrectArabicChars(request.Title)!;
    user.Role = request.Role;

    if (request.Password != null)
    {
        user.PasswordChangedAt = DateTime.UtcNow;
        user.PasswordHash = utility.ComputeSha256Hash(request.Password);
    }

    await repositoryManager.SaveAsync();

    return Results.NoContent();

});

#endregion User Endpoints

#region Report Endpoints

app.MapGet("/api/report/personnel", async ([FromServices] IHttpContextAccessor httpContextAccessor, [FromServices] RepositoryManager repositoryManager,
                                                  [FromQuery] Guid? cityId = null, [FromQuery] Guid? mojtameId = null, [FromQuery] bool? isMale = null, [FromQuery] bool? isSetad = null,
                                                  [FromQuery] int? noeMahalKhedmat = null) =>
{
    MyUtility utility = new();

    UserRequestAccessResult userRequestAccessResult = await utility.CheckUserAccess(httpContextAccessor.HttpContext!, repositoryManager, [(int)Constances.UserRole.admin, (int)Constances.UserRole.manager]);

    if (userRequestAccessResult.HasAccess == false)
    {
        return Results.Json(new { userRequestAccessResult.Error, userRequestAccessResult.Act }, statusCode: userRequestAccessResult.StatusCode);
    }

    List<Personnel> personnelList = await repositoryManager.Personnel.GetReport(cityId, mojtameId,isMale, isSetad, noeMahalKhedmat);

    const int columnsCount = 19;

    string[,] excelContent = new string[personnelList.Count + 1, columnsCount];

    string[] headerRow = ["ردیف","نام خانوادگی","نام","شماره پرسنلی","کد ملی","ابلاغ داخلی اصلی","سایر سمت‌ها","واحد خدمت","صف/ستاد","جنسیت","مدرک تحصیلی",
                          "رشته تحصیلی","نوع استخدام","پست","رشته شغلی","شهر محل خدمت","مجتمع قضائی","تاریخ آغاز خدمت","نوع محل خدمت"];

    // generate header
    for (int col = 0; col < columnsCount; col++)
    {
        excelContent[0, col] = headerRow[col];
    }

    for (int row = 1; row <= personnelList.Count; row++)
    {
        excelContent[row, 0] = row.ToString();
        excelContent[row, 1] = personnelList[row - 1].LastName;
        excelContent[row, 2] = personnelList[row - 1].FirstName;
        excelContent[row, 3] = personnelList[row - 1].ShomarePersonneli;
        excelContent[row, 4] = personnelList[row - 1].CodeMeli ?? "";
        excelContent[row, 5] = personnelList[row - 1].EblaghDakheli?.Title ?? "";
        excelContent[row, 6] = personnelList[row - 1].SayerSematha ?? "";
        excelContent[row, 7] = personnelList[row - 1].VahedKhedmat ?? "";
        excelContent[row, 8] = personnelList[row - 1].IsSetad ? "ستاد" : "صف";
        excelContent[row, 9] = personnelList[row - 1].IsMale ? "مرد" : "زن";
        excelContent[row, 10] = personnelList[row - 1].MadrakTahsili?.Title ?? "";
        excelContent[row, 11] = personnelList[row - 1].ReshteTahsili?.Title ?? "";
        excelContent[row, 12] = personnelList[row - 1].NoeEstekhdam?.Title ?? "";
        excelContent[row, 13] = personnelList[row - 1].Post?.Title ?? "";
        excelContent[row, 14] = personnelList[row - 1].ReshteShoghli?.Title ?? "";
        excelContent[row, 15] = personnelList[row - 1].ShahrMahalKhedmat?.Title ?? "";
        excelContent[row, 16] = personnelList[row - 1].MojtameGhazaiy?.Title ?? "";
        excelContent[row, 17] = personnelList[row - 1].TarikhAghazKhedmat ?? "";
        excelContent[row, 18] = personnelList[row - 1].NoeMahalKhedmat == 1 ? "دادگاه" : (personnelList[row - 1].NoeMahalKhedmat == 2 ? "دادسرا" : "سایر");
    }

    return Results.File(new Excel().GenerateAndReturn(excelContent), 
                        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        fileDownloadName: $"report.xlsx");
});

#endregion Report Endpoints

app.MapGet("/api/test", () => {return Results.Ok("Hello Farbod!");});

app.Run();


public record UserRequestAccessResult(bool HasAccess, string? Error = null, string? Act = null, int? StatusCode = null);
file record InitInfoAddRequest(int Type, Guid? ParentId, string Title, bool Active);
file record InitInfoUpdateRequest(Guid? ParentId, string Title, bool Active);
file record LoginRequest(string Username, string Password);
file record ChangeMyPasswordRequest(string NewPassword, string ConfirmPassword, string CurrentPassword);
file record PersonnelItemRequest(
            string? CodeMeli,
            string FirstName,
            string LastName,
            string ShomarePersonneli,
            string? TarikhAghazKhedmat,
            string? VahedKhedmat,
            bool IsMale,
            bool IsSetad,
            string? SayerSematha,
            Guid EblaghDakheliAsliId,
            Guid ShahrMahalKhedmatId,
            Guid? MadrakTahsiliId,
            Guid? ReshteTahsiliId,
            Guid? PostId,
            Guid? ReshteShoghliId,
            Guid? MojtameGhazaiyId,
            Guid? NoeEstekhdamId,
            int NoeMahalKhedmat
    );
file record AddUserRequest(string Username, string Password, string Title, int Role);
file record UpdateUserRequest(string? Password, string Title, int Role);