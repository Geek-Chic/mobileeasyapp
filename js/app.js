/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “HttpBasic认证” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	var serverip = 'http://mobileeasy.cc:19898';
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (!checkMobile(loginInfo.account)) {
			return callback('请确认手机号码是否正确');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		//		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		//		var authed = users.some(function(user) {
		//			return loginInfo.account == user.account && loginInfo.password == user.password;
		//		});
		mui.ajax(serverip + '/api/i/userLogin', {
			data: '{ }',
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				"Authorization": "Basic " + btoa(loginInfo.account + ":" + loginInfo.password)
			},
			success: function(data, status, xhr) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				console.log("code: %s, message: %s, content: %s, token: %s",
					data.code, data.message, data.content, xhr.getResponseHeader('x-auth-token'));
				authed = true;
				owner.createState(loginInfo.account, callback);
				if (data.code == 1) {
					plus.storage.setItem('token', xhr.getResponseHeader('x-auth-token'));
					return callback();
				} else {
					return callback("登录失败：" + data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(xhr, type, errorThrown);
				return callback("登录失败！");
			}
		});

	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if (!checkMobile(regInfo.account)) {
			return callback('请确认手机号码是否正确');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		mui.ajax(serverip + '/api/create', {
			data: JSON.stringify({
				'username': regInfo.account,
				'password': regInfo.password
			}),
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			contentType: 'application/json;',
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				console.log(data.code);
				if (data.code == 1) {
					return callback();
				} else {
					return callback("注册失败：" + data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(xhr, type, errorThrown);
				return callback("注册失败！");
			}
		});

	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	var checkMobile = function(mobile) {
		mobile = mobile || '';
		var pattern = /^1[345789][0-9]{9}$/;
		return pattern.test(mobile);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(mobile, callback) {
		callback = callback || $.noop;
		if (!checkMobile(mobile)) {
			return callback('手机号码不合法');
		}
		return callback(null, '新的随机密码已经发送到您的手机，请查看短信。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));