const _ = require('lodash');

const { BU } = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const Model = require('./Model');

const { BASE_KEY } = Model;

class Converter extends AbstConverter {
  /**
   * protocol_info.option --> true: 3.3kW, any: 600W
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // BU.CLI(generationInfo);
    const cmdList = this.defaultGenCMD(generationInfo);
    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // BU.CLI('currTransferCmd', currTransferCmd);
    // 0: Header1 1: Header2, 2: StationID
    const RES_DATA_START_POINT = 3;
    const resId = deviceData.readInt8(2);
    const reqId = currTransferCmd.readInt8(2);
    const resChkSum = deviceData.slice(deviceData.length - 1);

    // 전송 데이터 유효성 체크
    if (deviceData.length !== 32) {
      throw new Error(`The expected length(32) 
        of the data body is different from the length(${deviceData.length}) received.`);
    }

    // 인버터 국번 비교
    if (!_.eq(reqId, resId)) {
      throw new Error(`Not Matching ReqAddr: ${reqId}, ResAddr: ${resId}`);
    }

    // 수신 받은 데이터 체크섬 계산
    const calcChkSum = this.protocolConverter.getXorBuffer(
      deviceData.slice(0, deviceData.length - 1),
    );

    // 체크섬 비교
    if (!_.isEqual(calcChkSum, resChkSum)) {
      throw new Error(
        `Not Matching Check Sum: ${calcChkSum}, Res Check Sum: ${resChkSum}`,
      );
    }

    // 헤더와 체크섬을 제외한 데이터 계산
    const dataBody = deviceData.slice(RES_DATA_START_POINT, deviceData.length - 1);
    // BU.CLI(dataBody);

    // 데이터 자동 산정
    /** @type {BASE_KEY} */
    let dataMap = this.automaticDecoding(
      this.decodingTable.DEFAULT.decodingDataList,
      dataBody,
    );

    // 인버터에서 PV출력 및 GRID 출력을 주지 않으므로 계산하여 집어넣음
    // PV 전압
    const pvVol = _.chain(dataMap).get('pvVol').head().value();

    const pvVol2 = _.chain(dataMap).get('pvVol2').head().value();

    // PV 전류
    const pvAmp = _.chain(dataMap).get('pvAmp').head().value();

    // PV 전력
    if (_.isNumber(pvVol) && _.isNumber(pvAmp)) {
      let pvKw = pvVol * pvAmp * 0.001;
      // 1번째 전압과 2번째 전압의 수치가 같다면 DC 2 CH은 없는 것으로 판단함
      if (pvVol === pvVol2) {
        dataMap.pvKw.push(_.round(pvKw, 4));
      } else {
        pvKw += pvVol2 * pvAmp * 0.001;
        dataMap.pvKw.push(_.round(pvKw, 4));
      }
    }

    // GRID 전압
    const gridRsVol = _.chain(dataMap).get('gridRsVol').head().value();

    // GRID 전류
    const gridRAmp = _.chain(dataMap).get('gridRAmp').head().value();

    // GRID 전력
    if (_.isNumber(gridRsVol) && _.isNumber(gridRAmp)) {
      dataMap.powerGridKw.push(_.round(gridRsVol * gridRAmp * 0.001, 4));
    }

    // Trobule 목록을 하나로 합침
    dataMap.operTroubleList = [_.flatten(dataMap.operTroubleList)];

    // FIXME: 영산포 오른쪽 인버터 부터
    if (_.isEqual(this.model.dialing, Buffer.from([47]))) {
      dataMap.powerCpKwh[0] -= 2237;
    } else if (_.isEqual(this.model.dialing, Buffer.from([85]))) {
      dataMap.powerCpKwh[0] -= 1048;
    } else if (_.isEqual(this.model.dialing, Buffer.from([46]))) {
      dataMap.powerCpKwh[0] += 2085;
    } else if (_.isEqual(this.model.dialing, Buffer.from([86]))) {
      dataMap.powerCpKwh[0] -= 3421;
    }

    // 만약 인버터가 운영중인 데이터가 아니라면 현재 데이터를 무시한다.
    if (_.eq(_.head(dataMap.operIsRun), 0)) {
      dataMap = this.model.BASE_MODEL;
    }

    return dataMap;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: 46,
    mainCategory: 'Inverter',
    subCategory: 'ESP3K5',
  });

  const requestMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
  });

  // BU.CLI(requestMsg);

  const dataList = [
    // '0249b1b73a510a3500510a4a093900cf018b0040070000000000015702ae006317ff03',
    '0249b1b72ed4063800d4064309270054015c00000000000000000158024b0063131403',
    '0249b1b72e9206260092062e091a006a015b0008000000000000015802c8006313e803',
    // '0249b1b72e8c0644008c064a092e006c010e0150130000000000015802020163130803',
    // '0249b1b72ed4063800d406430927005401 5c00 000000 000000000158024b0063131403',
    // '0249b1b72e8c0644008c064a092e006c01 0e01 501300 00000000015802020163130803',
  ];

  dataList.forEach((d, index) => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    const dataMap = converter.concreteParsingData(realBuffer, requestMsg[index].data);
    console.log(dataMap);
  });
}
