// ==UserScript==
// @name        「ONE·一个」网站增强
// @namespace   https://github.com/jiajunw/one-enhanced
// @description 为「ONE·一个」网站增加方便的功能
// @icon        https://raw.githubusercontent.com/JiajunW/One-Enhanced/master/res/icon.png
// @include     http://wufazhuce.com/one/vol*
// @version     1.0.0
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

function add_style() {
    var custom_css = "\
      #enhanced-navbar > a {\
        position: fixed;\
        display: block;\
        background-color: #01AEF0;\
        width: 64px;\
        height: 64px;\
        line-height: 64px;\
        text-align: center;\
      }\
    \
      #enhanced-newer {\
        top: 50%;\
        left: 0;\
        margin-top: -32px;\
        border-top-right-radius: 42px;\
        border-bottom-right-radius: 42px;\
      }\
    \
      #enhanced-older {\
        top: 50%;\
        right: 0;\
        margin-top: -32px;\
        border-top-left-radius: 42px;\
        border-bottom-left-radius: 42px;\
      }\
    \
      #enhanced-navbar span {\
        color: white;\
        line-height: inherit;\
        font-size: 40px;\
        top: 2px;\
      }\
    ";
    GM_addStyle(custom_css);
}

function get_today_no() {
    var the_day_before_first = new Date(2012, 10 - 1, 7);
    var today = new Date();

    var diff = new Date(today - the_day_before_first);
    var days = diff / 1000 / 60 / 60 / 24;
    return Math.floor(days);
}

function get_cur_no() {
    var url_path = document.location.pathname;
    var re = /^\/one\/vol\.(\d+)/g;
    var matches = re.exec(url_path);
    if (matches && matches.length > 1) {
        return parseInt(matches[1]);
    }
}

function dom(tag, attr, inner) {
    var tag = document.createElement(tag);
    for (var key in attr) {
        if (attr.hasOwnProperty(key)) {
            tag.setAttribute(key,attr[key]);
        }
    }
    if (inner) {
        tag.innerHTML = inner;
    }
    return tag;
}

function add_nav() {
    var newest = get_today_no(),
        oldest = 1,
        cur = get_cur_no();

    var new_nav = dom('nav', { id : 'enhanced-navbar' });
    document.body.appendChild(new_nav);

    var url = '/one/vol.'
    if (cur < newest) {
        var url_next = url + (cur + 1);
        var new_nav_newer = dom(
            'a',
            { id : 'enhanced-newer', href : url_next },
            '<span class="glyphicon glyphicon-circle-arrow-left"></span>'
        );
        new_nav.appendChild(new_nav_newer);
    }

    if (cur > oldest) {
        var url_prev = url + (cur - 1);
        var new_nav_older = dom(
            'a',
            { id : 'enhanced-older', href : url_prev },
            '<span class="glyphicon glyphicon-circle-arrow-right"></span>'
        );
        new_nav.appendChild(new_nav_older);
    }

    if (cur === newest) {
        /*
         * tomorrow's post can be published at today's anytime
         * so we must look up whether tomorrow's post is published or not
         * note: only do the look up if we are viewing today's post
         */
        var tomorrow_no = newest + 1;

        var tomorrow_url = '/one/vol.' + tomorrow_no;
        GM_xmlhttpRequest({
            url: tomorrow_url,
            method: "HEAD",
            onload: function(response) {
                if (response.status == 200) {
                    // has already published
                    // add the nav bar
                    var new_nav_newer = dom(
                        'a',
                        { id : 'enhanced-newer', href : tomorrow_url },
                        '<span class="glyphicon glyphicon-circle-arrow-left"></span>'
                    );
                    new_nav.appendChild(new_nav_newer);
                }
            }
        });
    }

    add_style();
}

var header = document.querySelector('.page-header > h1');
if (header && header.innerHTML.trim() === '404 Not Found') {
    // this is a 404 page
} else {
    add_nav();
}
