var express = require("express");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var async = require("async");
var ejs = require('ejs');
var request = request.defaults({ jar: request.jar() });

var cookieJar = request.jar();
var app = express();

var mongodb = require('mongodb');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/js', express.static(__dirname + '/public/js'));


var MongoClient = require('mongodb').MongoClient;
var db;
// Initialize connection once
MongoClient.connect("mongodb://localhost:27017/flight", function(err, database) {
  if(err) throw err;
  db = database;
});

// Reuse database object in request handlers
app.get('/',function(req,res){
    res.render('index.html');
});

app.get('/getData', function(req, res){
    var results = [];
    db.collection("test").find({}, function(err, docs) {
        results ={'data': "docs"};
        
    }); 

    var collection = db.collection('test');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
        res.send(docs);
    });
});

app.get('/vietnamairlinesMonth', function(req, res){
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    // lay ngay thang hien tai
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second; 
    //danh sach cac ma san bay Tu HCM-> va tu HaNoi->
    // Tu HCM->
    var CodeAirportHCM = ['HAN', 'DAD', 'HPH', 'NHA', 'HUI', 'VII', 'PQC', 'BMV', 'UIH', 'DLI', 'THD', 'VDH', 'VCL', 'PXU'];
    // Tu HN->
    var codeAirportHN = ['SGN', 'DAD', 'DLI', 'NHA', 'BMW', 'PXU', 'UIH', 'PXU', 'VCL'];
    //Thang
    var MonthAirport = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    //Nam
    var YearAirport = [year, parseInt(year) + 1, parseInt(year) + 2];


    var i = 0;
    setInterval(function(){
        if(CodeAirportHCM[i] == null)
        {
            i = 0;
        }
        // chieu ve dayFJS.monthFJS.yearFJS  dayTJS.monthTJS.yearTJS
        var result = [];
        //check in database have 

        var origin = 'SGN';
        var destination = CodeAirportHCM[i];
        var departureDate = '15-12-2015';
        var returnDate = '16-12-2015';
        var numAdults = 1;
        var numChildren = 0;
        var numInfants = 0;
        i = i + 1;
        //start
        async.parallel([
            //======================================== VietJest ==============================
            function(callback)
            {
                var NgayDi = formartVJDay(departureDate);
                var ThangNamDi = formartVJMY(departureDate);
                var NgayVe = formartVJDay(returnDate);
                var ThangNamVe = formartVJMY(returnDate);
                var round = '';
                if(returnDate.length > 2){
                    round = 'on'
                }
                var url = 'https://book.vietjetair.com/ameliapost.aspx?lang=vi'; //;'https://ameliaweb5.intelisys.ca/VietJet/ameliapost.aspx?lang=vi';
                var options = {
                    'chkRoundTrip'        :  round,//on
                    'lstOrigAP'         :  origin,
                    'lstDestAP'         :  destination,
                    'dlstDepDate_Day'     :  NgayDi,
                    'dlstDepDate_Month'     :  ThangNamDi,
                    'dlstRetDate_Day'     :  NgayVe,
                    'dlstRetDate_Month'     :   ThangNamVe,
                    'lstCurrency'       :  'VND',
                    'lstResCurrency'      :  'VND',
                    'lstDepDateRange'     :  '0',
                    'lstRetDateRange'     :  '0',
                    'txtNumAdults'        :  numAdults,
                    'txtNumChildren'      :  numChildren,
                    'txtNumInfants'       :  numInfants,
                    'lstLvlService'       :  '1',
                    'blnFares'          :  'true'
                };

                var jar = request.jar(); 
                request({
                    url: url,
                    form: options,
                    method: 'post',
                    gzip : true ,
                    jar: jar,
                }, function(err, response, body){
                    var $ = cheerio.load(body);
                    //update session
                    
                    if(response.headers['set-cookie']){
                        cookie1 = response.headers['set-cookie'];
                    }
                    var __VIEWSTATE = $('#__VIEWSTATE').attr('value');
                    var SesID = $('#SesID').attr('value');
                    var DebugID = $('#SesID').attr('value');
                    var options = {
                        '__VIEWSTATE'               :   __VIEWSTATE,
                        'SesID'                     :   SesID,
                        'DebugID'                   :   DebugID,
                        'lstOrigAP'                 :   '-1',
                        'lstDestAP'                 :   '-1',
                        'dlstDepDate_Day'           :   NgayDi,
                        'dlstDepDate_Month'         :   ThangNamDi,
                        'lstDepDateRange'           :   '0',
                        'dlstRetDate_Day'           :   NgayVe,
                        'dlstRetDate_Month'         :   ThangNamVe,
                        'lstRetDateRange'           :   '0',
                        'txtNumAdults'              :   '0',
                        'txtNumChildren'            :   '0',
                        'txtNumInfants'             :   '0',
                        'lstLvlService'             :   '1',
                        'lstResCurrency'            :   'VND',
                        'lstCurrency'               :   'VND',
                        'txtPromoCode'              :   '',
                    }
                    var link = 'https://book.vietjetair.com/ameliapost.aspx?lang=vi'; //'https://ameliaweb5.intelisys.ca/VietJet/ameliapost.aspx?lang=vi';
                    var header = {
                        'Cookie': cookie1,
                    };
                    request({
                        url: link,
                        method: 'post',
                        form: options,
                        gzip : true,
                        headers: header,
                        followRedirect: true,
                    }, function(err, response, html){
                        var $ = cheerio.load(html);
                        var result = [];
                        //lay du lieu bao gom ngay - gia tien 
                        //lay du lieu dong 1
                        $("table#ctrValueViewerDepGrid tr").eq(2).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 1 str.substr(3,5)
                            result.push({
                                'type': 'vj',
                                'chieu': 'di',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 2 
                        $("table#ctrValueViewerDepGrid tr").eq(3).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 1
                            result.push({
                                'type': 'vj',
                                'chieu': 'di',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 3
                        $("table#ctrValueViewerDepGrid tr").eq(4).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 3
                            result.push({
                                'type': 'vj',
                                'chieu': 'di',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 4 
                        $("table#ctrValueViewerDepGrid tr").eq(5).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 4
                            result.push({
                                'type': 'vj',
                                'chieu': 'di',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 5 
                        $("table#ctrValueViewerDepGrid tr").eq(6).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 4
                            result.push({
                                'type': 'vj',
                                'chieu': 'di',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //=================================== chieu ve ==============================
                       
                        $("table#ctrValueViewerRetGrid tr").eq(2).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 1 str.substr(3,5)
                            result.push({
                                'type': 'vj',
                                'chieu': 've',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 2 
                        $("table#ctrValueViewerRetGrid tr").eq(3).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 1
                            result.push({
                                'type': 'vj',
                                'chieu': 've',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 3
                        $("table#ctrValueViewerRetGrid tr").eq(4).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 3
                            result.push({
                                'type': 'vj',
                                'chieu': 've',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 4 
                        $("table#ctrValueViewerRetGrid tr").eq(5).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 4
                            result.push({
                                'type': 'vj',
                                'chieu': 've',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        //lay du lieu dong 5 
                        $("table#ctrValueViewerRetGrid tr").eq(6).find('td').each(function(index){
                            //gom 4 dong  1-2-3-4 du lieu trong 1 thang
                            //dong 4
                            result.push({
                                'type': 'vj',
                                'chieu': 've',
                                'day': $(this).attr('id'),
                                'price': $(this).find('p.vvFare').html(),
                            });
                        });
                        callback(null, result);
                    });
                });
            }
        ], function(error, results){
            

            //We need to work with "MongoClient" interface in order to connect to a mongodb server.
            var MongoClient = mongodb.MongoClient;

            // Connection URL. This is where your mongodb server is running.
            var url = 'mongodb://localhost:27017/flight';

            MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                //HURRAY!! We are connected. :)
                console.log('Connection established to', url);
                var timeCurrent = month + ' ' + day + ', '+ year;
                var collection = db.collection('test');
                var result = results[0];
                var optionData = {
                    'daytime': new Date(timeCurrent),
                    'origin': origin,
                    'destination': destination,
                    'Type': 'VJ',
                    'Month': '11',
                    'Year': '2015',
                    'Flight': results[0]
                };

                collection.insert(optionData, {w:1}, function(err, result) {});
                //Close connection
                db.close();
                }
            });    
            
        });
        //end
    }, 10000);
})
//end month

/* 
    chuan la ngay-thang-nam
    3 chuan format thoi gian
    vietnamAirlines la nam - thang - ngay
    Jestart la ngay\thang\nam
    VietjestAir tach rieng ngay ra con lai thang\nam

*/
function formartVNA(string)
{
    var count = string.length;
    if(count > 0)
    {
        var arr;
        arr = string.split("-");
        var result = arr[2]+'-'+arr[1]+'-'+arr[0];
    }
    else
    {
        result = false;
    }
    return result;
}
function formatVNAday(string){
    var count = string.length;
    if(count > 0)
    {
        var arr;
        arr = string.split("-");
        var result = arr[0];
    }
    else
    {
        result = false;
    }
    return result;
}
function formatVNAmonth(string){
    var count = string.length;
    if(count > 0)
    {
        var arr;
        arr = string.split("-");
        var result = arr[1];
    }
    else
    {
        result = false;
    }
    return result;
}

function formatVNAyear(string){
    var count = string.length;
    if(count > 0)
    {
        var arr;
        arr = string.split("-");
        var result = arr[2];
    }
    else
    {
        result = false;
    }
    return result;
}

function formartVJDay(string)
{
    var count = string.length;
    if(count > 0)
    {
        var arr;
        arr = string.split("-");
        var result = arr[0];
    }
    else
    {
        result = false;
    }
    return result;
}
function formartVJMY(string)
{
    var count = string.length;
    if(count > 0)
    {
        var arr;
        arr = string.split("-");
        var result = arr[2]+'/'+arr[1];
    }
    else
    {
        result = false;
    }
    return result;
}
function str_replace(string, searchstring, valuestring)
{
    var count = string.length;
    var result = '';
    if(count > 0){
        for(var i = 0; i < count; i++)
        {
            if(string[i] == searchstring)
            {
                string[i] = valuestring;
                result += valuestring;
            }
            else{
                result += string[i];
            }
        }
    }
    else
    {
        result = false;
    }
    return result;
}


app.listen(2020, function(){
    console.log("App started on PORT 2020");
});
