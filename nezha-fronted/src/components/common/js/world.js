import * as jsonData from "./geoJSONData";

const scale = 6; //默认缩放比
const coordinateSpanByZoom = { //各缩放比例下map显示范围的经纬度跨度
  6: [60, 20]
};
export const worldData = jsonData["world"];
const worldDataDecode = decode(worldData);

export function getProvinceJson(coordinate) { //根据中心点坐标，动态返回四周的省份信息。
  //同时间只显示自身和周围共9块省级区划
  //console.info(coordinate);
  let countryNames = getCountries(coordinate, scale);
  //console.info(countryNames.join("\n"));
  //拼接json
  let newWorldData = JSON.parse(JSON.stringify(worldDataDecode));
  countryNames.forEach(countryName => {
    if (jsonData[countryName]) {
      //let countryDecode = jsonData[countryName];
      let countryDecode = decode(jsonData[countryName]);
      //console.info(countryDecode)
      newWorldData.features = newWorldData.features.concat(countryDecode.features);
    }
  });
  //console.info(JSON.stringify(newWorldData.features[newWorldData.features.length-1]));
  return newWorldData;
}
function getCountries(coordinate, currentScale) { //根据参数当前中心坐标、当前缩放比，得出需要显示省级区划的小块内的国家
  let x = coordinateSpanByZoom[currentScale][0];
  let y = coordinateSpanByZoom[currentScale][1];
  let rangeX = [coordinate[0] < (-180+x) ? -180 : (Math.floor(coordinate[0]/x)-1)*x, (Math.floor(coordinate[0]/x)+1)*x];
  let rangeY = [coordinate[1] < (-90+y) ? -90 : (Math.floor(coordinate[1]/y)-1)*y, (Math.floor(coordinate[1]/y)+1)*y];
/*
  let rangeX = [coordinate[0] < (-180+x) ? -180 : (coordinate[0]/x-1)*x, (coordinate[0]/x+1)*x];
  let rangeY = [coordinate[1] < (-90+y) ? -90 : (coordinate[1]/y-1)*y, (coordinate[1]/y+1)*y];
*/
  //console.info(rangeX, rangeY);
  let countries = [];
  for (let country in jsonData.countryCoordinates) { //jsonData.countryCoordinates是各国首都坐标数据
    let countryX = jsonData.countryCoordinates[country][currentScale][0];
    let countryY = jsonData.countryCoordinates[country][currentScale][1];
    if (countryX > rangeX[0] && countryX <= rangeX[1] && countryY > rangeY[0] && countryY <= rangeY[1]) { //这个国家在范围内
      //console.info(countryX, countryY);
      countries.push(country);
    }
  }
  return countries;
}

function decode(json) {
  if (!json.UTF8Encoding) {
    return json;
  }
  var encodeScale = json.UTF8Scale;
  if (encodeScale == null) {
    encodeScale = 1024;
  }

  var features = json.features;

  for (var f = 0; f < features.length; f++) {
    var feature = features[f];
    var geometry = feature.geometry;
    var coordinates = geometry.coordinates;
    var encodeOffsets = geometry.encodeOffsets;

    for (var c = 0; c < coordinates.length; c++) {
      var coordinate = coordinates[c];

      if (geometry.type === 'Polygon') {
        coordinates[c] = decodePolygon(
          coordinate,
          encodeOffsets[c],
          encodeScale
        );
      }
      else if (geometry.type === 'MultiPolygon') {
        for (var c2 = 0; c2 < coordinate.length; c2++) {
          var polygon = coordinate[c2];
          coordinate[c2] = decodePolygon(
            polygon,
            encodeOffsets[c][c2],
            encodeScale
          );
        }
      }
    }
  }
  // Has been decoded
  json.UTF8Encoding = false;
  return json;
}

function decodePolygon(coordinate, encodeOffsets, encodeScale) {
  var result = [];
  var prevX = encodeOffsets[0];
  var prevY = encodeOffsets[1];

  for (var i = 0; i < coordinate.length; i += 2) {
    var x = coordinate.charCodeAt(i) - 64;
    var y = coordinate.charCodeAt(i + 1) - 64;
    // ZigZag decoding
    x = (x >> 1) ^ (-(x & 1));
    y = (y >> 1) ^ (-(y & 1));
    // Delta deocding
    x += prevX;
    y += prevY;

    prevX = x;
    prevY = y;
    // Dequantize
    result.push([x / encodeScale, y / encodeScale]);
  }

  return result;
}
