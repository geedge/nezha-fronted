function none(value,index){
  return value;
}
function short(value,index){
  return asciiCompute(value,1000,['','K','Mil','Bil'],0)
}
function percent01(value,index){
  return `${value}%`;
}
function percent02(value,index){
  return `${value * 100 }%`;
}
function localFormat(value,index){
  let num = (value || 0).toString();
  let result = '';
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) { result = num + result; }
  return result;
}
function bits(value,index){
  return asciiCompute(value,1024,['b','B','KB','MB','GB','TB','PB','EB','ZB','YB'],0)
}
function bytes(value,index){
  return asciiCompute(value,1024,['B','KB','MB','GB','TB','PB','EB','ZB','YB'],0)
}
function kilobytes(value,index){
  return asciiCompute(value,1024,['KB','MB','GB','TB','PB','EB','ZB','YB'],0)
}
function megabytes(value,index){
  return asciiCompute(value,1024,['MB','GB','TB','PB','EB','ZB','YB'],0)
}
function gigabytes(value,index){
  return asciiCompute(value,1024,['GB','TB','PB','EB','ZB','YB'],0)
}
function terabytes(value,index){
  return asciiCompute(value,1024,['TB','PB','EB','ZB','YB'],0)
}
function petabytes(value,index){
  return asciiCompute(value,1024,['PB','EB','ZB','YB'],0)
}
function packetsSec(value,index){
  return asciiCompute(value,1000,['pps','Kpps','Mpps','Gpps','Tpps','Ppps','Epps','Zpps','Ypps'],1)
}
function bitsSec(value,index){
  return asciiCompute(value,1000,['bps','Kbps','Mbps','Gbps','Tbps','Pbps','Epps','Zpps','Ypps'],1)
}
function bytesSec(value,index){
  return asciiCompute(value,1000,['Bs','KBs','MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
}
function kilobytesSec(value,index){
  return asciiCompute(value,1000,['KBs','MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
}
function kilobitsSec(value,index){
  return asciiCompute(value,1000,['Kbps','Mbps','Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],1)
}
function megabytesSec(value,index){
  return asciiCompute(value,1000,['MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
}
function megabitsSec(value,index){
  return asciiCompute(value,1000,['Mbps','Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],1)
}
function gigabytesSec(value,index){
  return asciiCompute(value,1000,['GBs','TBs','PBs','EBs','ZBs','YBs'],1)
}
function gigabitsSec(value,index){
  return asciiCompute(value,1000,['Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],1)
}
function terabytesSec(value,index){
  return asciiCompute(value,1000,['TBs','PBs','EBs','ZBs','YBs'],1)
}
function terabitsSec(value,index){
  return asciiCompute(value,1000,['Tbps','Pbps','Ebps','Zbps','Ybps'],1)
}
function petabytesSec(value,index){
  return asciiCompute(value,1000,['PBs','EBs','ZBs','YBs'],1)
}
function petabitsSec(value,index){
  return asciiCompute(value,1000,['Pbps','Ebps','Zbps','Ybps'],1)
}
function Hertz(value,index){
  return asciiCompute(value,1000,['Hz','KHz','MHz','GHz','THz','PHz','EHz','ZHz','YHz'],1);
}
function nanoseconds(value,index){

}
/*
* 一般数值格式化方法
* num: 需要格式化的值
* ascii:进制，比如数据为1024
* units：单位列表
* dot：保留的小数位，
* unitIndex：不需要传递，用于递归获取units中的单位
* */
function asciiCompute(num,ascii,units,dot=2,unitIndex=0){
  num = parseFloat(num)
  let quotient=num / ascii;
  if(unitIndex <= units.length-1){
    if(quotient <1 ){ //不足以进位
      let toFixed=parseFloat(num.toFixed(dot));
      if(toFixed == 0){
        return `${num}${units[unitIndex]}`
      }else{
        return `${num.toFixed(dot)}${units[unitIndex]}`;
      }
    }else if(quotient >= 1 && quotient <10){ //可以进位，但是又不足以更进一位
      if(unitIndex >= units.length-1){
        unitIndex++;
        return asciiCompute(num,ascii,units,dot,unitIndex);
      }else{
        unitIndex++;
        return `${quotient.toFixed(dot)}${units[unitIndex]}`;
      }
    } else{ //可以更进一位
      if(unitIndex >=  units.length-1){
        unitIndex++;
        return asciiCompute(num,ascii,units,dot,unitIndex);
      }else{
        unitIndex++;
        num=quotient;
        return asciiCompute(num,ascii,units,dot,unitIndex);
      }
    }
  }else{
    return `${num.toFixed(2)}${units[units.length-1]}`;
  }

}
/*
* 时间格式化方法
* */

//unit转化配置信息
/*
* value:传递给数据库的值
* label：下拉选显示的名字
* compute：用于格式化计算的方法，返回一个string类型的串
* */
let unitOptions=[
  {//Misc start
    value:'Misc',
    label:'Misc',
    children:[
      {
        value:1,
        compute:none,
        label:'none'
      },
      {
        value:2,
        compute:short,
        label:'short'
      },
      {
        value:3,
        compute:percent01,
        label:'percent(0-100)'
      },
      {
        value:4,
        compute:percent02,
        label:'percent(0.0-0.1)'
      },
      {
        value:5,
        compute:localFormat,
        label:'local format'
      }
    ]
  },//Misc end
  {//Data start
    value:'Data',
    label:'Data',
    children: [
      {
        value:6,
        compute:bits,
        label:'bits'
      },
      {
        value:7,
        compute:bytes,
        label:'bytes'
      },
      {
        value:8,
        compute:kilobytes,
        label:'kilobytes'
      },
      {
        value:9,
        compute:megabytes,
        label:'megabytes'
      },
      {
        value:10,
        compute:gigabytes,
        label:'gigabytes'
      },
      {
        value:11,
        compute:terabytes,
        label:'terabytes'
      },
      {
        value:12,
        compute:petabytes,
        label:'petabytes'
      }
    ]
  },//Data end
  {//DataRate start
    value:'DataRate',
    label:'DataRate',
    children: [
      {
        value:13,
        compute:packetsSec,
        label:'packets/sec'
      },
      {
        value:14,
        compute:bitsSec,
        label:'bits/sec'
      },
      {
        value:15,
        compute:bytesSec,
        label:'bytes/sec'
      },
      {
        value:16,
        compute:kilobytesSec,
        label:'kilobytes/sec'
      },
      {
        value:17,
        compute:kilobitsSec,
        label:'kilobits/sec'
      },
      {
        value:18,
        compute:megabytesSec,
        label:'megabytes/sec'
      },
      {
        value:19,
        compute:megabitsSec,
        label:'megabits/sec'
      },
      {
        value:20,
        compute:gigabytesSec,
        label:'gigabytes/sec'
      },
      {
        value:21,
        compute:gigabitsSec,
        label:'gigabits/sec'
      },
      {
        value:22,
        compute:terabytesSec,
        label:'terabytes/sec'
      },
      {
        value:23,
        compute:terabitsSec,
        label:'terabits/sec'
      },
      {
        value:24,
        compute:petabytesSec,
        label:'petabytes/sec'
      },
      {
        value:25,
        compute:petabitsSec,
        label:'petabits/sec'
      }
    ]
  },//DataRate end
  {//Time start
    value:'Time',
    label: 'Time',
    children: [
      {
        value:26,
        compute:Hertz,
        label:'Hertz (1/s)'
      },
      {
        value:27,
        compute:nanoseconds,
        label:'nanoseconds (ns)'
      },
      {
        value:28,
        compute:null,
        label:'microseconds (us)'
      },
      {
        value:29,
        compute:null,
        label:'milliseconds (ms)'
      },
      {
        value:30,
        compute:null,
        label:'seconds (s)'
      },
      {
        value:31,
        compute:null,
        label:'minutes (m)'
      },
      {
        value:32,
        compute:null,
        label:'hours (h)'
      },
      {
        value:33,
        compute:null,
        label:'days (d)'
      },
    ]
  }//Time end
]
let units=[];
window.onload=function(){
  unitOptions.forEach((item,index)=>{
    item.children.forEach((n,i)=>{
      units.push(n);
    })
  })
  console.log(units)
}

export default {
  unitOptions:function(){
    return unitOptions;
  },
  getUnit:function(index){
    return units[index-1];
  },
  short,
}
