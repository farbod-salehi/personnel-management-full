using ClosedXML.Excel;

namespace API.Helpers
{
    public class Excel
    {
        public byte[] GenerateAndReturn(string[,] cells, string sheetName = "Sheet1")
        {
            using XLWorkbook workbook = new();

            var worksheet = workbook.AddWorksheet(sheetName);


            // index of rows and columns in Excel starts from 1, not 0
            for (int row = 1; row <= cells.GetLength(0); row++)
            {
                for (int column = 1; column <= cells.GetLength(1); column++)
                {
                    worksheet.Cell(row, column).Value = cells[row-1, column-1];
                }
            }



            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            return stream.ToArray();
        }
    }
}
