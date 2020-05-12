/*
* value:yAxis 默认第一个参数  传递的数值
* index:yAxis 默认第二个参数 y轴的位置
* type:自定义参数，用于区分是y轴调用还是tooltip调用,以设置不同精度  type =1 y轴调用 type=2 tooltip调用
* */
function none(value,index){
  return value;
}
function short(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['','K','Mil','Bil'],0)
  }else{
    return asciiCompute(value,1000,['','K','Mil','Bil'],2)
  }

}
function percent01(value,index){
  return `${value} %`;
}
function percent02(value,index){
  return `${value * 100 } %`;
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
function bits(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['b','B','KB','MB','GB','TB','PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['b','B','KB','MB','GB','TB','PB','EB','ZB','YB'],2)
  }
}
function bytes(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['B','KB','MB','GB','TB','PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['B','KB','MB','GB','TB','PB','EB','ZB','YB'],2)
  }

}
function kilobytes(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['KB','MB','GB','TB','PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['KB','MB','GB','TB','PB','EB','ZB','YB'],2)
  }

}
function megabytes(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['MB','GB','TB','PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['MB','GB','TB','PB','EB','ZB','YB'],2)
  }

}
function gigabytes(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['GB','TB','PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['GB','TB','PB','EB','ZB','YB'],2)
  }
}
function terabytes(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['TB','PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['TB','PB','EB','ZB','YB'],2)
  }
}
function petabytes(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1024,['PB','EB','ZB','YB'],0)
  }else{
    return asciiCompute(value,1024,['PB','EB','ZB','YB'],2)
  }
}
function packetsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['pps','Kpps','Mpps','Gpps','Tpps','Ppps','Epps','Zpps','Ypps'],1)
  }else{
    return asciiCompute(value,1000,['pps','Kpps','Mpps','Gpps','Tpps','Ppps','Epps','Zpps','Ypps'],2)
  }
}
function bitsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['bps','Kbps','Mbps','Gbps','Tbps','Pbps','Epps','Zpps','Ypps'],1)
  }else{
    return asciiCompute(value,1000,['bps','Kbps','Mbps','Gbps','Tbps','Pbps','Epps','Zpps','Ypps'],2)
  }
}
function bytesSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Bs','KBs','MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
  }else{
    return asciiCompute(value,1000,['Bs','KBs','MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],2)
  }
}
function kilobytesSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['KBs','MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
  }else{
    return asciiCompute(value,1000,['KBs','MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
  }
}
function kilobitsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Kbps','Mbps','Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],1)
  }else{
    return asciiCompute(value,1000,['Kbps','Mbps','Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],2)
  }

}
function megabytesSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],1)
  }else{
    return asciiCompute(value,1000,['MBs','GBs','TBs','PBs','EBs','ZBs','YBs'],2)
  }

}
function megabitsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Mbps','Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],1)
  }else{
    return asciiCompute(value,1000,['Mbps','Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],2)
  }

}
function gigabytesSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['GBs','TBs','PBs','EBs','ZBs','YBs'],1)
  }else{
    return asciiCompute(value,1000,['GBs','TBs','PBs','EBs','ZBs','YBs'],2)
  }

}
function gigabitsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],1)
  }else{
    return asciiCompute(value,1000,['Gbps','Tbps','Pbps','Ebps','Zbps','Ybps'],2)
  }

}
function terabytesSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['TBs','PBs','EBs','ZBs','YBs'],1)
  }else{
    return asciiCompute(value,1000,['TBs','PBs','EBs','ZBs','YBs'],2)
  }

}
function terabitsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Tbps','Pbps','Ebps','Zbps','Ybps'],1)
  }else{
    return asciiCompute(value,1000,['Tbps','Pbps','Ebps','Zbps','Ybps'],2)
  }

}
function petabytesSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['PBs','EBs','ZBs','YBs'],1)
  }else{
    return asciiCompute(value,1000,['PBs','EBs','ZBs','YBs'],2)
  }

}
function petabitsSec(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Pbps','Ebps','Zbps','Ybps'],1)
  }else{
    return asciiCompute(value,1000,['Pbps','Ebps','Zbps','Ybps'],2)
  }

}
function Hertz(value,index,type=1){
  if(type == 1){
    return asciiCompute(value,1000,['Hz','KHz','MHz','GHz','THz','PHz','EHz','ZHz','YHz'],1);
  }else{
    return asciiCompute(value,1000,['Hz','KHz','MHz','GHz','THz','PHz','EHz','ZHz','YHz'],2);
  }

}
function nanoseconds(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'ns');
  }else{
    return timeCompute(value,'ns',2);
  }

}
function microseconds(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'us')
  }else{
    return timeCompute(value,'us',2)
  }

}
function milliseconds(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'ms')
  }else{
    return timeCompute(value,'ms',2)
  }

}
function seconds(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'s');
  }else{
    return timeCompute(value,'s',2);
  }

}
function minutes(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'m');
  }else{
    return timeCompute(value,'m',2);
  }

}
function hours(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'h');
  }else{
    return timeCompute(value,'h',2);
  }

}
function days(value,index,type=1){
  if(type == 1){
    return timeCompute(value,'day');
  }else{
    return timeCompute(value,'day',3);
  }

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
        return `${num} ${units[unitIndex]}`
      }else{
        return `${num.toFixed(dot)} ${units[unitIndex]}`;
      }
    }else if(quotient >= 1 && quotient <10){ //可以进位，但是又不足以更进一位
      if(unitIndex >= units.length-1){
        unitIndex++;
        return asciiCompute(num,ascii,units,dot,unitIndex);
      }else{
        unitIndex++;
        return `${quotient.toFixed(dot)} ${units[unitIndex]}`;
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
    return `${num.toFixed(2)} ${units[units.length-1]}`;
  }

}
/*
* 时间格式化方法
* value:需要格式化的数值
* unit:设置的单位
* */
function timeCompute(value,unit,dot=0){
  if(unit == 'year'){
    return `${value.toFixed(dot)} ${unit}`;
  }
  let units=[
    {unit:'ns',ascii:1},
    {unit:'us',ascii:1000},
    {unit:'ms',ascii:1000},
    {unit:'s',ascii:60},
    {unit:'m',ascii:60},
    {unit:'h',ascii:24},
    {unit:'day',ascii:7},
    {unit:'week',ascii:52},
    {unit:'year',ascii:''}
  ]
  for(let i in units){
    let u = units[i];
    if(u.unit == unit){ //找到最小单位
      let result = (time,minUnit)=>{
        if(minUnit.unit == 'year'){
          return `${time.toFixed(dot)} ${minUnit.unit}`
        }
        let quotient = time / minUnit.ascii;
        if(quotient < 1){
          return `${Number(time).toFixed(dot)} ${minUnit.unit}`;
        }else{
          minUnit = units[++i];
          return result(quotient,minUnit);
        }
      }
      return result(value,u);
    }
  }
}

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
        compute:microseconds,
        label:'microseconds (us)'
      },
      {
        value:29,
        compute:milliseconds,
        label:'milliseconds (ms)'
      },
      {
        value:30,
        compute:seconds,
        label:'seconds (s)'
      },
      {
        value:31,
        compute:minutes,
        label:'minutes (m)'
      },
      {
        value:32,
        compute:hours,
        label:'hours (h)'
      },
      {
        value:33,
        compute:days,
        label:'days (d)'
      },
    ]
  }//Time end
]
let units=[];
window.onload=function(){
  if(units.length <1){
    unitOptions.forEach((item,index)=>{
      item.children.forEach((n,i)=>{
        units.push(n);
      })
    })
  }
}

export default {
  unitOptions:function(){
    return unitOptions;
  },
  getUnit:function(index){
    if(units.length < 1){
      unitOptions.forEach((item,index)=>{
        item.children.forEach((n,i)=>{
          units.push(n);
        })
      })
    }
    return units[index-1];
  },
  short
}
