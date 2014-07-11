var express = require('express');
var fs = require('fs');
var router = express.Router();

//第三方模块
var request = require('request')
    , weixin = require('../config/weixin.json')
    , select = require('xpath.js')
    , dom = require('xmldom').DOMParser
    , xml_digester = require("xml-digester")
    , digester = xml_digester.XmlDigester({});;

var sports = weixin.sports;
var searchGZconfig = weixin.searchGZconfig;
var gconfig = weixin.gconfig;
var page = 1;
var url = '';
var type = 1;
var cb = gconfig.cb;
var openid = gconfig.openid;
var baseUrl = weixin.gconfig.baseUrl;

/* GET users listing. */
router.get('/qa', function(req, res) {
	openid = req.query.openid;
	page = req.query.page;
	console.log("start: 【 ");
	console.log('\topenid: ' + openid)
	console.log('\tpage: ' + page)

  	//
  	var bodyData;

  	//获取源地址
	sports.forEach(function(sp, i){
	    if(sp.work != false){
	        console.log("\ttitle: " + sp.title);
	        url = baseUrl + '?cb=' + cb + '&openid=' + openid + '&page=' + page + '&t=' + (new Date().getTime());
	        console.log('\turl: ' + url);
	        fetchURL(url, sp.type);
	    }
	});
	console.log('end: 】');

	//抓取数据
	function fetchURL(url, type){
	    //请求源
	    var rq = request({uri: url}, function(error, response, body){
	    	if(!error && response.statusCode == 200){
	    		//解析
	    		body = parseBody(body);
	    		body = matchBody(body);
	    		var rsTojosn = JSON.parse(body);
	    		//获取对应数据
	    		var page = rsTojosn.page;
	    		var totalPages = rsTojosn.totalPages;
	    		var totalItems = rsTojosn.totalItems;
	    		var items = rsTojosn.items;
	    		//getItems(items);
	    		res.send(body);
	    	}else{
	    		res.send('{"code": "601", "message": "no nothing news <::>  !"');
	    	}
	    });
	}

});

//搜索公众号
router.get('/qagzh', function(req, res){
	console.log(req.query);
	var paramString = parseParams(req.query);
	//var searchKey = req.query.searchKey;
	//var query = searchKey || searchGZconfig.query;
	var baseUrl = searchGZconfig.baseUrl;
	//var uri = baseUrl + '?query=' + searchKey;
	var uri = baseUrl + '?' + paramString;
	//var uri = 'http://weixin.sogou.com/weixin?type=1&query=%E4%B8%AD%E5%9B%BD&ie=utf8&_ast=1405088640&_asf=null&w=01019900&cid=null&sut=3938&sst0=1405088865365&lkt=0%2C0%2C0';
	console.log(uri);
	var rq = request({ uri: uri, timeout: 5000 }, function(error, response, body){
		if(!error && response.statusCode == 200){
    		//解析
    		var rsBody = parseBodyGZH(body);
    		//
    		fs.writeFile('./temp/message.txt', rsBody, function (err) {
			  if (err) throw err;
			  	console.log('It\'s saved!');
			});
    		//console.log(body);
    		//res.send(body);
    	}else{
    		res.send('{"code": "601", "message": "很抱歉，我们未搜索到相关公众号信息 <::>  !"');
    	}
	});
});


router.get('/', function(req, res){
	res.render('weixin', { title: '新闻'});
});

//搜索公众号
router.get('/searchGZH', function(req, res){
	res.render('searchGZH', { title: '搜索微信公众号'});
});

function parseParams(paramsOBJ){
	var paramString = '';
	for(var key in paramsOBJ){
		paramString += key + '=' + paramsOBJ[key] + '&';
	}
	return paramString.replace(/&$/gi, '');
}

function parseBodyGZH(body){
	var body = body || '';
	body = body.replace(/(<head[\s\S]*?<\/head>)/gi, '')
				.replace(/(<form[\s\S]*?<\/form>)/gi, '')
				//.replace(/[\n|\t|\r]*/gi, '')
				.replace(/<!---*\s*(.*?)\s*---*>/gi, '')
				.replace(/<script.*?>[\s\S]*?<\/script>/ig, '');
	body = body.match(/(<div class="results mt7">[\s\S]*?<div class="right")/gi);
    return body[0];
}

function parseStrToDom(str){
	var strdom = str.replace('<div class="right"', '');
	return strdom;
}


function parseBody(body){
	var body = body || '';
	body = body.replace(/<!---*\s*(.*?)\s*---*>/gi, '');
    body = body.replace(/\/\/$/gi, '');
    return body;
}

function matchBody(body){
	var bs = body.match(/({(.*?)})/gi);
	return bs[0] ? bs[0] : '';
}


function getItems(itemArr){
	var itemArr = itemArr || []; //['<?xml version="1.0" encoding="gbk"?><DOCUMENT><item></item></DOCUMENT>'];
	itemArr.forEach(function(item){
		parseXML(item);
	});
}

function parseXML(xmlString){
	digester.digest(xmlString, function(err, result) {
		if (err) { 
			console.log(err);
		} else {
			console.log(result);
			// result will be { root: { foo: [ 'foo1', 'foo2' ], bar: 'bar1>' } }
		}
	});
}





module.exports = router;
