namespace API.Helpers
{
    public class Constances
    {
        public struct JWTSettings
        {
            public static string Key => "73960E37-F0F3-4DC9-8F3A-F9033FEAF8EC";
            public static int ValidDays => 30;
            public static string Issuer => "PersonnelManagerAPI";
            public static string Audience => "PersonnelManagerAPI";

        }

        public enum UserRole
        {
            admin = 1,
            manager,
            user
        }

        public enum NoeMahalKhedmat
        {
            Dadgah = 1,
            Dadsara,
            Sayer
        }

        public static List<(int Id, string Title)> NoeMahalKhematList
        {
            get
            {
                return [
                    ( (int)Constances.NoeMahalKhedmat.Dadgah,"دادگاه"),
                    ( (int)Constances.NoeMahalKhedmat.Dadsara,"دادسرا"),
                    ( (int)Constances.NoeMahalKhedmat.Sayer,"سایر")
                ];
            }
        }

        public enum InitInfoType
        {
            EblaghDakheliAsli = 1,
            MadrakTahsili,
            ReshteTahsili,
            ShahrMahalKhedmat,
            MojtameGhazaiy,
            NoeEstekhdam,
            Post,
            ReshteShoghli
        }

        public static List<(int Id, string Title)> GetInitInfoTypes()
        {
            return [
                ((int)InitInfoType.EblaghDakheliAsli, "ابلاغ داخلی اصلی"),
                ((int)InitInfoType.MadrakTahsili, "مدرک تحصیلی"),
                ((int)InitInfoType.ReshteTahsili, "رشته تحصیلی"),
                ((int)InitInfoType.ShahrMahalKhedmat, "شهر محل خدمت"),
                ((int)InitInfoType.MojtameGhazaiy, "مجتمع قضائی"),
                ((int)InitInfoType.NoeEstekhdam, "نوع استخدام"),
                ((int)InitInfoType.Post, "پست"),
                ((int)InitInfoType.ReshteShoghli, "رشته شغلی"),
            ];
        }

        public static int UserPasswordMinLength { get { return 6; } }

        public static string DevelopmentConnectionString
        {
            get
            {
                return "data source=.; initial catalog=PersonnelManagement;user id=sa;password=asdf;MultipleActiveResultSets=True;TrustServerCertificate=True";
            }
        }

        public static string ProductionConnectionString
        {
            get
            {
                return "data source=.; initial catalog=PersonnelManagement;user id=sa;password=asdf;MultipleActiveResultSets=True;TrustServerCertificate=True";
            }
        }

    }
}
