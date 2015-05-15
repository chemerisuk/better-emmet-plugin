describe("DOM.emmet", function() {
    "use strict";

    function checkExpr(source, target, vars) {
        it(source, function() {
            expect(DOM.emmet(source, vars)).toBe(target);
        });
    }

    checkExpr("", "");
    checkExpr("article", "<article></article>");

    describe("'+' operator", function() {
        checkExpr("p+p", "<p></p><p></p>");
        checkExpr("p.name+p+p", "<p class=\"name\"></p><p></p><p></p>");
    });

    describe("'>' operator", function() {
        checkExpr("p>em", "<p><em></em></p>");
        checkExpr("ul>li>a", "<ul><li><a></a></li></ul>");
        checkExpr("p.hello>em.world>span", "<p class=\"hello\"><em class=\"world\"><span></span></em></p>");
        checkExpr("a>b+(i>span)", "<a><b></b><i><span></span></i></a>");
    });

    describe("'^' operator", function() {
        checkExpr("p>em^div", "<p><em></em></p><div></div>");
        checkExpr("p>em>span^b", "<p><em><span></span></em><b></b></p>");
        checkExpr("p>em>span+i^b", "<p><em><span></span><i></i></em><b></b></p>");
        checkExpr("p>em>span^^div", "<p><em><span></span></em></p><div></div>");
        checkExpr("p>em>span^^^^div", "<p><em><span></span></em></p><div></div>");
    });

    describe("classes", function() {
        checkExpr("p.name", "<p class=\"name\"></p>");
        checkExpr("p.one.two.three", "<p class=\"one two three\"></p>");
        checkExpr("p.one.two-three", "<p class=\"one two-three\"></p>");
        checkExpr("p.one_two-three", "<p class=\"one_two-three\"></p>");
    });

    describe("id", function() {
        checkExpr("p#myid", "<p id=\"myid\"></p>");
        checkExpr("p#myid.name_with-dash32.otherclass", "<p id=\"myid\" class=\"name_with-dash32 otherclass\"></p>");
        checkExpr("span#three.one.two", "<span id=\"three\" class=\"one two\"></span>");
        checkExpr("span.one.two#three", "<span class=\"one two\" id=\"three\"></span>");
    });

    describe("attributes", function() {
        checkExpr("a[]", "<a></a>");
        checkExpr("a[title]", "<a title=\"title\"></a>");
        checkExpr("a[title href]", "<a title=\"title\" href=\"href\"></a>");
        checkExpr("a.test[title href]", "<a class=\"test\" title=\"title\" href=\"href\"></a>");
        checkExpr("a.test[title href]", "<a class=\"test\" title=\"title\" href=\"href\"></a>");
        checkExpr("a#one.two[title href]", "<a id=\"one\" class=\"two\" title=\"title\" href=\"href\"></a>");
        checkExpr("a[title=hello]", "<a title=\"hello\"></a>");
        checkExpr("a[title=`hello world`]", "<a title=\"hello world\"></a>");
        checkExpr("a[title=`{\"hello\":\"world\"}`]", "<a title='{\"hello\":\"world\"}'></a>");
        checkExpr("a[title=`hello world` href=other]", "<a title=\"hello world\" href=\"other\"></a>");
        checkExpr("a[title=`hello world` href=other name]", "<a title=\"hello world\" href=\"other\" name=\"name\"></a>");
        checkExpr("a[title=`hello world` href=other name]>em", "<a title=\"hello world\" href=\"other\" name=\"name\"><em></em></a>");
        checkExpr("section[id=javascript.files]", "<section id=\"javascript.files\"></section>");
        checkExpr("a[b c=`d'f`]", "<a b=\"b\" c=\"d'f\"></a>");
        checkExpr("a[b c=`d\"f`]", "<a b=\"b\" c='d\"f'></a>");
        checkExpr("input[type=text disabled]", "<input type=\"text\" disabled=\"disabled\">");
        checkExpr("a[href=b   c]", "<a href=\"b\" c=\"c\"></a>");
        checkExpr("table[a=b].days>tr>td[c=d]*2", "<table a=\"b\" class=\"days\"><tr><td c=\"d\"></td><td c=\"d\"></td></tr></table>");
        checkExpr("table.days[a=b]>tr>td[c=d]*2", "<table class=\"days\" a=\"b\"><tr><td c=\"d\"></td><td c=\"d\"></td></tr></table>");
    });

    describe("variables", function() {
        checkExpr("ul#nav>li.item$*3", "<ul id=\"nav\"><li class=\"item1\"></li><li class=\"item2\"></li><li class=\"item3\"></li></ul>");
        checkExpr("ul#nav>li.item$$$*3", "<ul id=\"nav\"><li class=\"item001\"></li><li class=\"item002\"></li><li class=\"item003\"></li></ul>");
        checkExpr("ul#nav>li.$$item$$$*3", "<ul id=\"nav\"><li class=\"01item001\"></li><li class=\"02item002\"></li><li class=\"03item003\"></li></ul>");
        checkExpr("ul#nav>li.pre$*3+li.post$*3", "<ul id=\"nav\"><li class=\"pre1\"></li><li class=\"pre2\"></li><li class=\"pre3\"></li><li class=\"post1\"></li><li class=\"post2\"></li><li class=\"post3\"></li></ul>");

        checkExpr("div.sample$*3", "<div class=\"sample1\"></div><div class=\"sample2\"></div><div class=\"sample3\"></div>");
        checkExpr("li#id$.class$*3", "<li id=\"id1\" class=\"class1\"></li><li id=\"id2\" class=\"class2\"></li><li id=\"id3\" class=\"class3\"></li>");

        checkExpr("ul>(li>b)*3", "<ul><li><b></b></li><li><b></b></li><li><b></b></li></ul>");
        checkExpr("ul>li*3>b", "<ul><li><b></b></li><li><b></b></li><li><b></b></li></ul>");

        checkExpr("a>`{c}`", "<a>{c}</a>", {b: "test"});
        checkExpr("a>`{c}`", "<a>test</a>", {c: "test"});
        checkExpr("a.{c}>`{c}`", "<a class=\"test\">test</a>", {c: "test"});
        checkExpr("a#{b}>`{c}`", "<a id=\"bbb\">test</a>", {c: "test", b: "bbb"});
        checkExpr("div[class=foo-{lang}]*2", "<div class=\"foo-en\"></div><div class=\"foo-en\"></div>", {lang: "en"});
        checkExpr("div[class=foo-$lang]*2", "<div class=\"foo-1lang\"></div><div class=\"foo-2lang\"></div>", {lang: "en"});
        checkExpr("i>`{0}`", "<i></i>", [""]);
        checkExpr("i>`{0}:`", "<i>:</i>", [""]);
        checkExpr("i>span+`{0}`", "<i><span></span></i>", [""]);
        checkExpr("i>`{0}`+span", "<i><span></span></i>", [""]);

        checkExpr("a[b={0}]>`{1}`", "<a b=\"\">test</a>", ["", "test"]);
        checkExpr("a[b=`{0}`]>`{1}`", "<a b=\"\">test</a>", ["", "test"]);
    });

    describe("groups", function() {
        checkExpr("div#head+(p>span)+div#footer", "<div id=\"head\"></div><p><span></span></p><div id=\"footer\"></div>");
        checkExpr("div#head>((ul#nav>li*3)+(div.subnav>p)+(div.othernav))+div#footer", "<div id=\"head\"><ul id=\"nav\"><li></li><li></li><li></li></ul><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div><div id=\"footer\"></div></div>");
        checkExpr("div#head>(ul#nav>li*3>(div.subnav>p)+(div.othernav))+div#footer", "<div id=\"head\"><ul id=\"nav\"><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li><li><div class=\"subnav\"><p></p></div><div class=\"othernav\"></div></li></ul><div id=\"footer\"></div></div>");
        checkExpr("ul>li.pre$*2+(li.item$*4>a)+li.post$*2", "<ul><li class=\"pre1\"></li><li class=\"pre2\"></li><li class=\"item1\"><a></a></li><li class=\"item2\"><a></a></li><li class=\"item3\"><a></a></li><li class=\"item4\"><a></a></li><li class=\"post1\"></li><li class=\"post2\"></li></ul>");
        checkExpr("div>(i+b)*2+(span+em)*3", "<div><i></i><b></b><i></i><b></b><span></span><em></em><span></span><em></em><span></span><em></em></div>");
        checkExpr("(span.i$)*3", "<span class=\"i1\"></span><span class=\"i2\"></span><span class=\"i3\"></span>");
        // checkExpr("(p.i$+ul>li.i$*2>span.s$)*3", "<p class=\"i1\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul><p class=\"i2\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul><p class=\"i3\"></p><ul><li class=\"i1\"><span class=\"s1\"></span></li><li class=\"i2\"><span class=\"s2\"></span></li></ul>");
        checkExpr("p.p$*2>(i.i$+b.b$)*3", "<p class=\"p1\"><i class=\"i1\"></i><b class=\"b1\"></b><i class=\"i2\"></i><b class=\"b2\"></b><i class=\"i3\"></i><b class=\"b3\"></b></p><p class=\"p2\"><i class=\"i1\"></i><b class=\"b1\"></b><i class=\"i2\"></i><b class=\"b2\"></b><i class=\"i3\"></i><b class=\"b3\"></b></p>");
        // checkExpr("a.c[d=$@2]*3>b>`Card $@-5`", "<a class=\"c\" d=\"2\"><b>Card 7</b></a><a class=\"c\" d=\"3\"><b>Card 6</b></a><a class=\"c\" d=\"4\"><b>Card 5</b></a>");
        checkExpr("(a.c[d=$@2]>b>`Card $@-5`)*3", "<a class=\"c\" d=\"2\"><b>Card 7</b></a><a class=\"c\" d=\"3\"><b>Card 6</b></a><a class=\"c\" d=\"4\"><b>Card 5</b></a>");
    });

    describe("text nodes", function() {
        checkExpr("span>`Hello world`", "<span>Hello world</span>");
        checkExpr("span>`Hello`+` world`", "<span>Hello world</span>");
        checkExpr("span>`<Hello\"> & </world> '`", "<span>&lt;Hello&quot;&gt; &amp; &lt;/world&gt; &#039;</span>");
        checkExpr("span>`Click `+(a[href=/url/]>`here`)+` for more info`", "<span>Click <a href=\"/url/\">here</a> for more info</span>");
        checkExpr("a>`{0}: `+span+span", "<a>test: <span></span><span></span></a>", ["test"]);
        checkExpr("p>i.z+`{0}`+br+`{1}`", "<p><i class=\"z\"></i>{0}<br>{1}</p>");
    });

    it("should throw error on invalid args", function() {
        expect(function() { DOM.emmet({}); }).toThrow();
        expect(function() { DOM.emmet(it); }).toThrow();
        expect(function() { DOM.emmet(434); }).toThrow();
    });
});
