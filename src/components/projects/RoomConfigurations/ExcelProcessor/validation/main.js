// ExcelProcessor/validation/main.js
import { processExcelToJson } from '../ExcelProcessor'; // 假设在相同的路径下

export function validateExcel(fileContent) {
    const allTextData = processExcelToJson(fileContent);

    if (!allTextData) {
        return 'No valid data found in the Excel file';
    }

    // 将JSON格式转为一维数组的字符串返回
    return JSON.stringify(allTextData, null, 2);
}
