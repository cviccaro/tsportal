'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('TSPortal', function() {
  describe('Login View', function() {
    beforeEach(function() {
      browser.get('/');
    });
    it('should redirect index.html to index.html#/auth', function() {
      browser.getLocationAbsUrl().then(function(url) {
          expect(url).toEqual('/auth');
        });
    });
    it('should login', function() {
      var email = element(by.model('email'));
      var password = element(by.model('password'));
      email.sendKeys('philips@wesco.com');
      password.sendKeys('wescoapp');
      element.all(by.css('.btn-primary')).first().click();
    });
  })
  describe('Tradeshow list control', function() {
      it('should now be on #tradeshows and get default 15 per page', function() {
        browser.getLocationAbsUrl().then(function(url) {
          expect(url).toEqual('/tradeshows');
        })
        var tradeshowList = element.all(by.repeater('tradeshow in tradeshows'));
        expect(tradeshowList.count()).toBe(15);
      })
      it('should display leads when tradeshow is clicked', function() {
        element.all(by.css('tr.clickable')).first().click();
        var leadList = element.all(by.repeater('lead in leads'));
        expect(leadList.count()).toBe(50);
      })
      it('should be possible to control tradeshow order via drop down select boxes', function() {
        var tradeshowNameColumn = element.all(by.repeater('tradeshow in tradeshows').column('tradeshow.name'));
        function getNames() {
          return tradeshowNameColumn.map(function(elem) {
            return elem.getText();
          });
        };

        element(by.model('orderBy')).element(by.css('option[value="name"]')).click();

        expect(getNames()).toEqual([
          'April 11 (Erin) (5687)', 
          'April 16 (Melissa) (3560)', 
          'April 18 (Melissa) (3560)', 
          'April 25 (Erin) (1763)', 
          'April 30 (Melissa)', 
          'April 4 (Melissa) (1765)', 
          'August 1 (Melissa) (7855)', 
          'August 12 2014', 
          'August 14 2014', 
          'August 15 (Melissa) (3225)', 
          'August 20 (Erin) (5439)', 
          'August 20 2015', 
          'August 22 (Erin) (3540)', 
          'August 27 2015', 
          'August 29 (Melissa) (7840)' 
        ]);
      });
      it('should be possible to change how many tradeshows are visible per page', function() {
        var perPage = element(by.model('perPage'));
        element(by.model('perPage')).element(by.css('option[value="30"]')).click();
        var tradeshowList = element.all(by.repeater('tradeshow in tradeshows'));
        expect(tradeshowList.count()).toBe(30);
      });

      it('should be possible to filter tradeshows by typing in search box', function() {
        var query = element(by.model('query'));
        query.sendKeys('June');
        var tradeshowNameColumn = element.all(by.repeater('tradeshow in tradeshows').column('tradeshow.name'));
        function getNames() {
          return tradeshowNameColumn.map(function(elem) {
            return elem.getText();
          });
        };

        expect(getNames()).toEqual([
          'June 11 (Erin ) (3605)',
          'June 12 2014',
          'June 13 (Erin) (7645)',
          'June 16 2015',
          'June 17 2014',
          'June 18 2015',
          'June 20 (Melissa)'
        ]);
      });

      it('should goto create tradeshow page', function() {
        element(by.css('.toolbar.buttons .btn-success')).click();
        browser.getLocationAbsUrl().then(function(url) {
          expect(url).toEqual('/tradeshows/create');
        });
      })
  })
  
  describe('Tradeshow Create View', function() {
    it('should be on tradeshow create page', function() {
         browser.get('/#/tradeshows/create');
        browser.getLocationAbsUrl().then(function(url) {
          expect(url).toEqual('/tradeshows/create');
        });
    });
  })
});



//   describe('Phone list view', function() {

//     beforeEach(function() {
//       browser.get('app/index.html#/phones');
//     });


//     it('should filter the phone list as a user types into the search box', function() {

//       var phoneList = element.all(by.repeater('phone in phones'));
//       var query = element(by.model('query'));

//       expect(phoneList.count()).toBe(20);

//       query.sendKeys('nexus');
//       expect(phoneList.count()).toBe(1);

//       query.clear();
//       query.sendKeys('motorola');
//       expect(phoneList.count()).toBe(8);
//     });


//     it('should be possible to control phone order via the drop down select box', function() {

//       var phoneNameColumn = element.all(by.repeater('phone in phones').column('phone.name'));
//       var query = element(by.model('query'));

//       function getNames() {
//         return phoneNameColumn.map(function(elm) {
//           return elm.getText();
//         });
//       }

//       query.sendKeys('tablet'); //let's narrow the dataset to make the test assertions shorter

//       expect(getNames()).toEqual([
//         "Motorola XOOM\u2122 with Wi-Fi",
//         "MOTOROLA XOOM\u2122"
//       ]);

//       element(by.model('orderProp')).element(by.css('option[value="name"]')).click();

//       expect(getNames()).toEqual([
//         "MOTOROLA XOOM\u2122",
//         "Motorola XOOM\u2122 with Wi-Fi"
//       ]);
//     });


//     it('should render phone specific links', function() {
//       var query = element(by.model('query'));
//       query.sendKeys('nexus');
//       element.all(by.css('.phones li a')).first().click();
//       browser.getLocationAbsUrl().then(function(url) {
//         expect(url).toEqual('/phones/nexus-s');
//       });
//     });
//   });


//   describe('Phone detail view', function() {

//     beforeEach(function() {
//       browser.get('app/index.html#/phones/nexus-s');
//     });


//     it('should display nexus-s page', function() {
//       expect(element(by.binding('phone.name')).getText()).toBe('Nexus S');
//     });


//     it('should display the first phone image as the main phone image', function() {
//       expect(element(by.css('img.phone')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
//     });


//     it('should swap main image if a thumbnail image is clicked on', function() {
//       element(by.css('.phone-thumbs li:nth-child(3) img')).click();
//       expect(element(by.css('img.phone')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);

//       element(by.css('.phone-thumbs li:nth-child(1) img')).click();
//       expect(element(by.css('img.phone')).getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
//     });
//   });
// });
