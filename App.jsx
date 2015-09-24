const maxLength = 11;

App = React.createClass({

  getInitialState() {
    return {
      startNumber: '',
      endNumber: '',
      generatedNumbers: []
    }
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

  generate() {
    function zeroPad(number, width) {
      var string = String(number);
      while (string.length < width)
        string = "0" + string;
      return string;
    }

    let middleLength = maxLength - this.state.startNumber.length - this.state.endNumber.length;
    let generatedNumbers = [];

    for (let i = 0; i < Math.pow(10, middleLength); i++) {
      generatedNumbers.push(this.state.startNumber + zeroPad(i, middleLength) + this.state.endNumber);
    }

    this.setState({
      generatedNumbers: generatedNumbers
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

  render() {
    return (
      <div className="container">
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

        <button
          className="generate-numbers"
          onClick={this.generate}
          disabled={this.state.startNumber.length < 3 || this.state.endNumber.length < 3}>
          生成号码
        </button>

        <br />

        { this.state.generatedNumbers.length > 0 ?
          <div className="result">
            <textarea className="generated-numbers" readOnly={true} rows="5" placeholder="还未生成号码" value={this.state.generatedNumbers.join('\n')}></textarea>
            <span>共生成{this.state.generatedNumbers.length}个号码</span>
          </div> : ''
        }

      </div>
                                 )
  }
});
