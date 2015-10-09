const maxLength = 11;

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
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
    for (;;) {
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

App = React.createClass({

  getInitialState() {
    return {
      startNumber: '',
      endNumber: ''
    }
  },

  componentWillMount() {
    let numberPairs = window.localStorage.getItem('numberPairs');
    this.setState({ numberPairs: JSON.parse(numberPairs) });
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
      '至少还需要输入' + (3 - this.state.startNumber.length) + '位数字' :
        '还能输入' + (this.startNumberMaxLength() - this.state.startNumber.length) + '位数字';
  },

  endNumberMaxLength() {
    return this.state.startNumber.length < 3 ? maxLength - 3 : maxLength - this.state.startNumber.length;
  },

  endNumberInputStatus() {
    return this.state.endNumber.length < 3 ?
      '至少还需要输入' + (3 - this.state.endNumber.length) + '位数字' :
        '还能输入' + (this.endNumberMaxLength() - this.state.endNumber.length) + '位数字';
  },

  showNumberPairs() {
    return this.state.numberPairs.map(numberPair => {
      let {start, end} = numberPair;
      let middle = 'x'.repeat(maxLength - start.length - end.length);
      let result = start + middle + end;
      return <li key={result}>{result}</li>
    });
  },

  exportToContacts() {
    // 更新numberPairs (state & localStorage)
    let nextNumberPairs = this.state.numberPairs.concat({start: this.state.startNumber, end: this.state.endNumber})
    this.setState({ numberPairs: nextNumberPairs });
    window.localStorage.setItem('numberPairs', JSON.stringify(nextNumberPairs));

  },

  numberPairHasBeenExported() {
    return _.some(this.state.numberPairs, numberPair => {
      return this.state.startNumber === numberPair.start && this.state.endNumber === numberPair.end;
    });
  },

  render() {
    return (
      <div className="container">
        {this.state.numberPairs ? (
          <div className="number-pairs">
            <h2>已导入号码字段</h2>
            <ul>
              {this.showNumberPairs()}
            </ul>
          </div>
          ) : ''}

          <input
            type="text"
            ref="startNumber"
            placeholder="输入开头数字"
            maxLength={this.startNumberMaxLength()}
            onChange={this.setStartNumber}
          />
          <span>{this.startNumberInputStatus()}</span>

          <br />

          <input
            type="text"
            ref="endNumber"
            placeholder="输入结尾数字"
            maxLength={this.endNumberMaxLength()}
            onChange={this.setEndNumber}
          />
          <span>{this.endNumberInputStatus()}</span>

          <br />

          <span>中间数字长度：{maxLength - this.state.startNumber.length - this.state.endNumber.length}</span>

          <br />

          {this.numberPairHasBeenExported() ?
            <span>已导入过该号码组合</span> :
              this.state.startNumber.length > 2 && this.state.endNumber.length > 2 ?
                <button onClick={this.exportToContacts}>导入到通讯录</button> :
                  <span>至少需要输入3位开头数字和3位结尾数字</span>
                  }


                </div>
    )
  }
});
