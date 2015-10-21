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
    it('should have blank values on create page', function() {
      var tradeshow_name = element(by.model('tradeshow.name'));
      expect(tradeshow_name.getText()).toEqual('');
    })
    it('should input values into the new tradeshow form', function() {
      var tradeshow_name = element(by.model('tradeshow.name'));
      tradeshow_name.sendKeys('protractor test');
      expect(tradeshow_name.getAttribute('value')).toEqual('protractor test');

      var tradeshow_location = element(by.model('tradeshow.location'));
      tradeshow_location.sendKeys('protractor test');
      expect(tradeshow_location.getAttribute('value')).toEqual('protractor test');

      var tradeshow_active = element(by.model('tradeshow.active'));
      element.all(by.css('.bootstrap-switch-handle-off')).click()
      expect(tradeshow_active.isSelected()).toBeTruthy()
    });
    it('should submit the form and end up on the new tradeshow\'s detail page', function() {
      element(by.id('save')).click().then(function() {
        element(by.css('.ngdialog')).click().then(function() {
          browser.getLocationAbsUrl().then(function(url) {
            expect(url).toMatch('/{1}tradeshows/{1}[0-9]+/{1}edit')
          });
        })
      });
    });
    it('should go back to tradeshow listing page and delete the new tradeshow', function() {
        browser.get('/#/tradeshows').then(function() {
          var tradeshows = element.all(by.repeater('tradeshow in tradeshows'));
          element(by.model('orderBy')).element(by.css('option[value="id"]')).click();
          element(by.model('orderByReverse')).element(by.css('option[value="1"]')).click();
          var query = element(by.model('query'));
          query.sendKeys('protractor test');
          expect(tradeshows.count()).toEqual(1);
          tradeshows.get(0).element(by.css('.btn-danger')).click()
          element(by.css('.ngdialog .btn-danger')).click().then(function() {
          })
       })
    });
    it('should not be able to find the deleted tradeshow.', function() {
      var tradeshows = element.all(by.repeater('tradeshow in tradeshows'));
      element(by.model('orderBy')).element(by.css('option[value="id"]')).click();
      element(by.model('orderByReverse')).element(by.css('option[value="1"]')).click();
      var query = element(by.model('query'));
      query.sendKeys('protractor test');
      expect(tradeshows.count()).toEqual(0);
    });
  })
});