using System;
using System.Globalization;

namespace API.Helpers;

public class PersianDateTime
{

    private readonly DateTime _dateTime;
    private readonly int _persianYear;
    private readonly int _persianMonth;
    private readonly int _persianDay;

    public PersianDateTime(DateTime dateTime)
    {
        _dateTime = dateTime;

        PersianCalendar persianCalendar = new();

        // استخراج اجزای تاریخ شمسی
        _persianYear = persianCalendar.GetYear(dateTime);
        _persianMonth = persianCalendar.GetMonth(dateTime);
        _persianDay = persianCalendar.GetDayOfMonth(dateTime);

    }

    
    public string GetShortDateTime()
    {
        return GetShortDate() + " - " + ConvertNumbersToPersianNumbers(_dateTime.ToShortTimeString());
    }

    public string GetShortDate(bool byPersianFigures = true)
    {
        string result = $"{_persianYear:0000}/{_persianMonth:00}/{_persianDay:00}";

        return byPersianFigures ? ConvertNumbersToPersianNumbers(result) : result;
    }
   
    public string GetNowDayAndDate()
    {
        // استخراج روز هفته
        DayOfWeek dayOfWeek = DateTime.Now.DayOfWeek;
        string persianDayOfWeek = GetPersianDayOfWeek(dayOfWeek);
        string persianMonthName = GetPersianMonth(_persianMonth);


        return ConvertNumbersToPersianNumbers($"{persianDayOfWeek} {_persianDay} {persianMonthName} {_persianYear}");
    }

    private static string GetPersianDayOfWeek(DayOfWeek dayOfWeek)
    {
        return dayOfWeek switch
        {
            DayOfWeek.Saturday => "شنبه",
            DayOfWeek.Sunday => "یک‌شنبه",
            DayOfWeek.Monday => "دوشنبه",
            DayOfWeek.Tuesday => "سه‌شنبه",
            DayOfWeek.Wednesday => "چهارشنبه",
            DayOfWeek.Thursday => "پنج‌شنبه",
            DayOfWeek.Friday => "جمعه",
            _ => "",
        };
    }

    private static string GetPersianMonth(int monthNumber)
    {
        return monthNumber switch
        {
            1 => "فروردین",
            2 => "اردیبهشت",
            3 => "خرداد",
            4 => "تیر",
            5 => "مرداد",
            6 => "شهریور",
            7 => "مهر",
            8 => "آبان",
            9 => "آذر",
            10 => "دی",
            11 => "بهمن",
            12 => "اسفند",
            _ => "",
        };
    }

    private static string ConvertNumbersToPersianNumbers(string? value)
    {
        return value?.Replace("0", "۰").Replace("1", "۱").
                      Replace("2", "۲").Replace("3", "۳").
                      Replace("4", "۴").Replace("5", "۵").
                      Replace("6", "۶").Replace("7", "۷").
                      Replace("8", "۸").Replace("9", "۹") ?? "";
    }
}
