const maxLength = 11;
if (!String.prototype.repeat) {
  String.prototype.repeat = function (count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (; ;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  }
}

function zeroPad(number, width) {
  var string = String(number);
  while (string.length < width)
    string = "0" + string;
  return string;
}


App = React.createClass({

  getInitialState() {
    return {
      startNumber: '',
      endNumber: ''
    }
  },

  componentWillMount() {
    let numberPairs = window.localStorage.getItem('numberPairs');
    this.setState({numberPairs: JSON.parse(numberPairs)});
  },

  setStartNumber(event) {
    event.preventDefault();

    let startNumber = React.findDOMNode(this.refs.startNumber).value.trim();

    this.setState({
      startNumber: startNumber
    });
  },

  setEndNumber(event) {
    event.preventDefault();

    let endNumber = React.findDOMNode(this.refs.endNumber).value.trim();

    this.setState({
      endNumber: endNumber
    });
  },

  startNumberMaxLength() {
    return this.state.endNumber.length < 3 ? maxLength - 3 : maxLength - this.state.endNumber.length;
  },

  startNumberInputStatus() {
    return this.state.startNumber.length < 3 ?
    '开头至少还需要输入' + (3 - this.state.startNumber.length) + '位数字' :
    '开头还能输入' + (this.startNumberMaxLength() - this.state.startNumber.length) + '位数字';
  },

  endNumberMaxLength() {
    return this.state.startNumber.length < 3 ? maxLength - 3 : maxLength - this.state.startNumber.length;
  },

  endNumberInputStatus() {
    return this.state.endNumber.length < 3 ?
    '后缀至少还需要输入' + (3 - this.state.endNumber.length) + '位数字' :
    '后缀还能输入' + (this.endNumberMaxLength() - this.state.endNumber.length) + '位数字';
  },

  showNumberPairs() {
    return this.state.numberPairs.map(numberPair => {
      let {start, end} = numberPair;
      let middle = 'x'.repeat(maxLength - start.length - end.length);
      let result = start + middle + end;
      return <li className="list-group-item" key={result}>{result}</li>
    });
  },

  exportToContacts() {
    if (this.numberPairHasBeenExported()) {
      alert("已导入过该号码组合");
      return
    }
    if (this.state.startNumber.length < 2 && this.state.endNumber.length < 2) {
      alert("需要输入3位开头数字和3位结尾数字");
      return
    }

    let start = this.state.startNumber;
    let end = this.state.endNumber;
    let length = maxLength - start.length - end.length;
    // 更新numberPairs (state & localStorage)
    let nextNumberPairs = (this.state.numberPairs && this.state.numberPairs.concat({
          start: start,
          end: end
        })) || [{start: start, end: end}];
    this.setState({numberPairs: nextNumberPairs});
    window.localStorage.setItem('numberPairs', JSON.stringify(nextNumberPairs));

    // actually export numbers to contacts, might take a long time
    for (let i = 0; i < Math.pow(10, length); i++) {
      let number = start + zeroPad(i, length) + end;
      let phoneNumbers = [];
      phoneNumbers[0] = new ContactField('mobile', number, true); // preferred number
      navigator.contacts.create({"phoneNumbers": phoneNumbers}).save(function () {
        alert('ok')
      });
    }


  },

  numberPairHasBeenExported() {
    return _.some(this.state.numberPairs, numberPair => {
      return this.state.startNumber === numberPair.start && this.state.endNumber === numberPair.end;
    });
  },

  render() {
    var style = {};
    style.center = {textAlign: 'center'};
    return (
        <div className="container">
          <h2 style={style.center}>编号神器</h2>

          <p className="color-gainsboro" style={style.center}>{this.startNumberInputStatus()}</p>
          <input className="form-control input-lg marginBottom"
                 type="number"
                 ref="startNumber"
                 placeholder="输入开头数字"
                 maxLength={this.startNumberMaxLength()}
                 onChange={this.setStartNumber}/>

          <p className="color-gainsboro" style={style.center}>{this.endNumberInputStatus()}</p>
          <input
              className="form-control input-lg marginBottom"
              type="number"
              ref="endNumber"
              placeholder="输入结尾数字"
              maxLength={this.endNumberMaxLength()}
              onChange={this.setEndNumber}
              />

          <div className="color-gainsboro marginBottom" style={style.center}>
            中间数字长度：{maxLength - this.state.startNumber.length - this.state.endNumber.length}
          </div>

          <button className="btn btn-primary btn-block btn-lg marginBottom" onClick={this.exportToContacts}>
            导入到通讯录
          </button>
          {this.state.numberPairs ? (
              <ul className="list-group">
                <li className="list-group-item disabled">已导入号码字段</li>
                {this.showNumberPairs()}
              </ul>
          ) : ''}
        </div>
    )
  }
});
