import { processExcelToJson } from '../ExcelProcessor'; // Import only what you need
import { validateDevices } from './Devices';
import { validateGroups } from './Groups';
import { validateScenes } from './Scenes';

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

    // Run validations for devices and capture deviceNameToType
    const { errors: deviceErrors, deviceNameToType } = validateDevices(splitData.devices);

    // Run validations for groups, passing the deviceNameToType
    const groupErrors = validateGroups(splitData.groups, deviceNameToType);

    // Run validations for scenes
    const sceneErrors = validateScenes(splitData.scenes, deviceNameToType);

    // Combine errors from all validations
    const allErrors = [
        ...deviceErrors,
        ...groupErrors,
        ...sceneErrors,
    ];

    return allErrors; // Return all errors
}