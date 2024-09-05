import { processExcelToJson } from '../ExcelProcessor'; // Import only what you need
import { validateDevices } from './Devices';
import { validateGroups } from './Groups';
import { validateScenes } from './Scenes';
import { validateRemoteControls } from './RemoteControls'; // 新增的导入

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

    console.log('****************************************************************');
    console.log(splitData);
    console.log('****************************************************************');

    // Run validations for devices and capture deviceNameToType
    const { errors: deviceErrors, deviceNameToType, registeredDeviceNames } = validateDevices(splitData.devices);

    // Run validations for groups, passing the deviceNameToType and capturing registeredGroupNames
    const { errors: groupErrors, registeredGroupNames } = validateGroups(splitData.groups, deviceNameToType);

    // Run validations for scenes, passing the deviceNameToType and capturing registeredSceneNames
    const { errors: sceneErrors, registeredSceneNames } = validateScenes(splitData.scenes, deviceNameToType);

    // Run validations for remote controls, passing all registered names
    const remoteControlErrors = validateRemoteControls(
        splitData.remoteControls,
        deviceNameToType,
        registeredDeviceNames,
        registeredGroupNames,
        registeredSceneNames
    );

    // 在每个错误数组后添加空字符串表示的空行
    const allErrors = [
        ...deviceErrors,
        '', // 空行分隔设备错误和其他错误
        ...groupErrors,
        '', // 空行分隔组错误和其他错误
        ...sceneErrors,
        '', // 空行分隔场景错误和其他错误
        ...remoteControlErrors
    ];

    // 返回所有错误，带有空行分隔
    return allErrors.filter(Boolean); // 过滤掉空数组或空字符串
}