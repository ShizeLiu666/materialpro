import { processExcelToJson } from '../ExcelProcessor'; // Import only what you need
import { validateDevices } from './Devices';

function splitJsonFile(content) {
    const splitKeywords = {
        devices: "KASTA DEVICE",
        groups: "KASTA GROUP",
        scenes: "KASTA SCENE",
        remoteControls: "REMOTE CONTROL LINK"
    };

    const splitData = { devices: [], groups: [], scenes: [], remoteControls: [] };
    let currentKey = null;

    content.forEach(line => {
        line = line.trim(); // Ensure no leading/trailing spaces

        if (Object.values(splitKeywords).includes(line)) {
            currentKey = Object.keys(splitKeywords).find(key => splitKeywords[key] === line);
            return;
        }

        if (currentKey) {
            splitData[currentKey].push(line);
        }
    });

    return splitData;
}

export function validateExcel(fileContent) {
    const allTextData = processExcelToJson(fileContent);

    if (!allTextData) {
        return ['No valid data found in the Excel file'];
    }

    const splitData = splitJsonFile(allTextData["programming details"]);

    // Debugging: Check the contents of splitData
    console.log('Split Data:', splitData);

    // Run validations
    const deviceErrors = validateDevices(splitData.devices);
    // Repeat for groups, scenes, remoteControls as needed

    // Combine errors from all validations
    const allErrors = [
        ...deviceErrors,
        // ...other errors from groups, scenes, remoteControls
    ];

    return allErrors; // Return all errors
}