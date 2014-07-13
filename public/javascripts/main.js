$(document).ready(function(){

//获取公众号新闻数据
	var getBtn = $('#getData-btn');

	getBtn.on('click', function(evt){
		var openid = $('#openid').val() || 'oIWsFtzP7MH_dxU6ybGOLA59u-yg';
		var page = $('#page').val() || 1;

		var postData = {
			openid: openid,
			page: page
		};

		$.getJSON('/weixin/qa', postData, function(res){
			console.log(typeof res);
			console.log(res);
			var items = res.items;
			var page = res.page;
			var totalItems = res.totalItems;
			var totalPages = res.totalPages;
			var i = 0, l = items.length;
			var displayList = [];

			for(;i < l; ++i){
				var xml4josn = parseXML(items[i]);
				var bodyString = '<div>' + ($(xml4josn).find('display')[0].innerHTML) + '</div>';
				var $$item = $(bodyString);
				var bodyObj = {
					title: parseCDATA($$item.find('title').html()),
					docid: parseCDATA($$item.find('docid').html()),
					url: parseCDATA($$item.find('url').html()),
					title1: parseCDATA($$item.find('title1').html()),
					imglink: parseCDATA($$item.find('imglink').html()),
					headimage: parseCDATA($$item.find('headimage').html()),
					sourcename: parseCDATA($$item.find('sourcename').html()),
					content168: parseCDATA($$item.find('content168').html()),
					site: parseCDATA($$item.find('site').html()),
					openid: parseCDATA($$item.find('openid').html()),
					content: parseCDATA($$item.find('content').html()),
					showurl: parseCDATA($$item.find('showurl').html()),
					date: parseCDATA($$item.find('date').html()),
					pagesize: parseCDATA($$item.find('pagesize').html())
				};
				//console.log(bodyObj);
				displayList.push(bodyObj);
			}

			//输出到页面
			printOutHTML(displayList);

		});

	});

//搜索公众号
	var searchBtn = $('#getGZH-btn');
	searchBtn.on('click', function(evt){
		var searchKey = $('#searchKey').val() || '新浪';

		var postData = {
			query	  : searchKey,
	        ie        : "utf8",
	        type      : 1,
	        _ast      : "1405088640",
	        _asf      : null,
	        w         : "01029901",
	        cid         : null
		};
		$.getJSON('/weixin/qagzh', postData, function(res){
			console.log(res)
			if(res.code == '200'){
				printGZHtoHTML(res.body);
			}else{
				alert('未找到相关公众号')
			}
		});
	});

	//解析公众号
	var printGZHtoHTML = function(list){

		var items = [];
		var item = {};
		for (var i = 0; i < list['name'].length; i++) {
			item = {
				authotion: list['authotion'][i],
				funcs: list['funcs'][i],
				icon: list['icon'][i],
				name: list['name'][i],
				newArticle: list['newArticle'][i],
				openid: list['openid'][i],
				qrcode: list['qrcode'][i],
				wxno: list['wxno'][i]
			};
			items.push(item);
		};
		

		console.log(items);
	};


	//解析公众号新闻
	var printOutHTML = function(list){
		console.log(list)
		var i = 0,
			l = list.length;
		var ulcon = '';

		$('#printOut').load('/templates/getNewsTpl.html', function(source){
			//console.log(source)
			var render = template.compile(source);
			var html = render({ listData: list });
			$('#printOut').html(html);
		});
	};

	var parseCDATA = function(str){
		//<![CDATA[创投半年盘点:创业如何避免早死?]]>
		if(/^\&lt;\!\[CDATA\[(.*)\]\]\&gt;$/.test(str)){
			return str.match(/^\&lt;\!\[CDATA\[(.*)\]\]\&gt;$/)[1];
		}else if(/^<!--\[CDATA\[(.*)\]\]-->$/.test(str)){
			return str.match(/^<!--\[CDATA\[(.*)\]\]-->$/)[1];
		}else{
			return str;
		}
	};

	var parseXML = function(data) {
		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
		return xml.documentElement;
	}


});