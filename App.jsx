const maxLength = 11;

App = React.createClass({

  getInitialState() {
    return {
      startNumber: '',
      endNumber: '',
      generatedNumbers: [],
      isGenerating: false
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

    let worker = new Worker('worker.js');
    let middleLength = maxLength - this.state.startNumber.length - this.state.endNumber.length;

    worker.onmessage = (event) => {
      this.setState({
        generatedNumbers: event.data,
        isGenerating: false
      });
    }

    this.setState({
      isGenerating: true
    });

    worker.postMessage({
      start: this.state.startNumber,
      end: this.state.endNumber,
      length: middleLength
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

  exportToExcel(event) {
    Meteor.call('downloadExcelFile', this.state.generatedNumbers, (err, fileUrl) => {
      if (err) {
        console.log(err);
      } else {
        var link = document.createElement("a");
        link.download = '生成号码.xlsx';
        link.href = fileUrl;
        link.click();
      }
    });
  },

  showNumbers() {
    return this.state.generatedNumbers.length > 0 ?
      <div className="result">
        <textarea className="generated-numbers" readOnly={true} rows="5" placeholder="还未生成号码" value={this.state.generatedNumbers.join('\n')}></textarea>
        <span>共生成{this.state.generatedNumbers.length}个号码</span>
        <button className="export-to-excel" onClick={this.exportToExcel}>导出</button>
      </div> : ''
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

        { this.state.isGenerating ?
          <span>工人正在生成号码，请稍等</span> : this.showNumbers()
        }


      </div>
    )
  }
});
