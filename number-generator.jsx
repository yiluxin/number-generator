temporaryFiles = new FileCollection('temporaryFiles',
  {resumable: false,   // Enable built-in resumable.js upload support
    http: [
      { method: 'get',
        path: '/:_id',  // this will be at route "/gridfs/temporaryFiles/:_id"
        lookup: function (params) {  // uses express style url params
          return { _id: params._id};       // a query mapping url to myFiles
        }
      },
      { method: 'post',
        path: '/:_id',
        lookup: function (params) {
          return {
            _id: params._id
          }
        }}
    ]
  }
);


if (Meteor.isClient) {
  Meteor.startup(function () {
    React.render(<App />, document.getElementById('render-target'));
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    temporaryFiles.allow({
      insert: function (userId, file) {
        return true;
      },
      remove: function (userId, file) {
        return true;
      },
      read: function (userId, file) {
        return true;
      },
      write: function (userId, file, fields) {
        return true;
      }
    });
  });

  Meteor.methods({
    downloadExcelFile : function(numbers) {
      var Future = Npm.require('fibers/future');
      var futureResponse = new Future();

      var excel = new Excel('xlsx');
      var workbook = excel.createWorkbook();
      var worksheet = excel.createWorksheet();
      worksheet.writeToCell(0,0, 'Groupname');
      worksheet.writeToCell(0,1, 'Lastname');
      worksheet.writeToCell(0,2, 'Firstname');
      worksheet.writeToCell(0,3, 'Mobile');

      worksheet.setColumnProperties([ // Example : setting the width of columns in the file
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 30 }
      ]);

      // Example : writing multple rows to file
      var row = 1;
      numbers.forEach((number) => {
        worksheet.writeToCell(row, 0, '');
        worksheet.writeToCell(row, 1, '');
        worksheet.writeToCell(row, 2, '');
        worksheet.writeToCell(row, 3, number);

        row++;
      });

      workbook.addSheet('MySheet', worksheet); // Add the worksheet to the workbook

      mkdirp('tmp', Meteor.bindEnvironment(function (err) {
        if (err) {
          console.log('Error creating tmp dir', err);
          futureResponse.throw(err);
        }
        else {
          var uuid = UUID.v4();
          var filePath = './tmp/' + uuid;
          workbook.writeToFile(filePath);

          temporaryFiles.importFile(filePath, {
            filename : uuid,
            contentType: 'application/octet-stream'
          }, function(err, file) {
            if (err) {
              futureResponse.throw(err);
            }
            else {
              futureResponse.return('/gridfs/temporaryFiles/' + file._id);
            }
          });
        }
      }));

      return futureResponse.wait();
    }
  });
}
