describe("DOM.emmet", function() {
    "use strict";

    /* jshint quotmark:false */

    function checkExpr(source, target, vars) {
        it(source, function() {
            expect(DOM.emmet(source, vars)).toBe(target);
        });
    }

    checkExpr("", ""); // new
    checkExpr("article", "<article></article>"); // new

    describe("Operator +", function() {
        checkExpr("p+p", "<p></p><p></p>");
        checkExpr("p+P", "<p></p><P></P>");
        checkExpr("p.name+p+p", "<p class=\"name\"></p><p></p><p></p>");
    });

    describe("Operator >", function() {
        checkExpr("p>em", "<p><em></em></p>");
        checkExpr("ul>li>a", "<ul><li><a></a></li></ul>");
        checkExpr("p.hello>em.world>span", "<p class=\"hello\"><em class=\"world\"><span></span></em></p>");
        checkExpr("a>b+(i>span)", "<a><b></b><i><span></span></i></a>");
    });

    describe('Attributes', function() {
        checkExpr("a[]", "<a></a>"); // new
        checkExpr('p.name', '<p class="name"></p>');
        checkExpr('p.one.two.three', '<p class="one two three"></p>');
        checkExpr('p.one-two.three', '<p class="one-two three"></p>');
        checkExpr('p.one.two-three', '<p class="one two-three"></p>');
        checkExpr('p.one_two-three', '<p class="one_two-three"></p>');
        checkExpr('p#myid', '<p id="myid"></p>');
        checkExpr('p#myid.name_with-dash32.otherclass', '<p id="myid" class="name_with-dash32 otherclass"></p>');
        checkExpr('span.one.two.three', '<span class="one two three"></span>');

        checkExpr('span.one#two', '<span class="one" id="two"></span>');
        checkExpr('span.one.two#three', '<span class="one two" id="three"></span>');

        checkExpr('span[title]', '<span title="title"></span>'); // diff
        checkExpr('span[title data]', '<span title="title" data="data"></span>'); // diff
        checkExpr('span.test[title data]', '<span class="test" title="title" data="data"></span>'); // diff
        checkExpr('span#one.two[title data]', '<span id="one" class="two" title="title" data="data"></span>'); // diff
        checkExpr('span[title=Hello]', '<span title="Hello"></span>');
        checkExpr('span[title="Hello world"]', '<span title="Hello world"></span>');
        checkExpr('span[title=\'Hello world\']', '<span title=\'Hello world\'></span>'); // diff
        checkExpr('span[title="Hello world" data=other]', '<span title="Hello world" data="other"></span>');
        checkExpr('span[title="Hello world" data=other attr2 attr3]', '<span title="Hello world" data="other" attr2="attr2" attr3="attr3"></span>'); // diff
        checkExpr('span[title="Hello world" data=other attr2 attr3]>em', '<span title="Hello world" data="other" attr2="attr2" attr3="attr3"><em></em></span>'); //diff
        checkExpr('filelist[id=javascript.files]', '<filelist id="javascript.files"></filelist>');
    });

    describe('Counters', function() {
        checkExpr('ul#nav>li.item$*3', '<ul id="nav"><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>');
        checkExpr('ul#nav>li.item$$$*3', '<ul id="nav"><li class="item001"></li><li class="item002"></li><li class="item003"></li></ul>');
        checkExpr('ul#nav>li.$$item$$$*3', '<ul id="nav"><li class="01item001"></li><li class="02item002"></li><li class="03item003"></li></ul>');
        checkExpr('ul#nav>li.pre$*3+li.post$*3', '<ul id="nav"><li class="pre1"></li><li class="pre2"></li><li class="pre3"></li><li class="post1"></li><li class="post2"></li><li class="post3"></li></ul>');
        checkExpr('div.sample$*3', '<div class="sample1"></div><div class="sample2"></div><div class="sample3"></div>'); // diff
        checkExpr('ul#nav>(li>{text})*3', '<ul id="nav"><li>text</li><li>text</li><li>text</li></ul>'); // diff

        // test counter base
        checkExpr('{$@3 }*3', '3 4 5 ');
        checkExpr('{$@- }*3', '3 2 1 ');
        checkExpr('{$@-5 }*3', '7 6 5 ');
    });

    describe('Groups', function() {
        checkExpr('div#head+(p>p)+div#footer', '<div id="head"></div><p><p></p></p><div id="footer"></div>');
        checkExpr('div#head>((ul#nav>li*3)+(div.subnav>p)+(div.othernav))+div#footer', '<div id="head"><ul id="nav"><li></li><li></li><li></li></ul><div class="subnav"><p></p></div><div class="othernav"></div><div id="footer"></div></div>');
        checkExpr('div#head>(ul#nav>li*3>(div.subnav>p)+(div.othernav))+div#footer', '<div id="head"><ul id="nav"><li><div class="subnav"><p></p></div><div class="othernav"></div></li><li><div class="subnav"><p></p></div><div class="othernav"></div></li><li><div class="subnav"><p></p></div><div class="othernav"></div></li></ul><div id="footer"></div></div>');
        checkExpr('ul>li.pre$*2+(li.item$*4>a)+li.post$*2', '<ul><li class="pre1"></li><li class="pre2"></li><li class="item1"><a></a></li><li class="item2"><a></a></li><li class="item3"><a></a></li><li class="item4"><a></a></li><li class="post1"></li><li class="post2"></li></ul>'); // diff
        checkExpr('div>(i+b)*2+(span+em)*3', '<div><i></i><b></b><i></i><b></b><span></span><em></em><span></span><em></em><span></span><em></em></div>');
    });

    describe('Group multiplication', function() {
        checkExpr('(span.i$)*3', '<span class="i1"></span><span class="i2"></span><span class="i3"></span>');
        checkExpr('p.p$*2>(i.i$+b.b$)*3', '<p class="p1"><i class="i1"></i><b class="b1"></b><i class="i2"></i><b class="b2"></b><i class="i3"></i><b class="b3"></b></p><p class="p2"><i class="i1"></i><b class="b1"></b><i class="i2"></i><b class="b2"></b><i class="i3"></i><b class="b3"></b></p>');
        // checkExpr('(p.i$+ul>li.i$*2>span.s$)*3', '<p class="i1"></p><ul><li class="i1"><span class="s1"></span></li><li class="i2"><span class="s2"></span></li></ul><p class="i2"></p><ul><li class="i1"><span class="s1"></span></li><li class="i2"><span class="s2"></span></li></ul><p class="i3"></p><ul><li class="i1"><span class="s1"></span></li><li class="i2"><span class="s2"></span></li></ul>');
    });

    describe('Text nodes', function() {
        // checkExpr('div>{foo}+a>{bar}', '<div>foo<a>bar</a></div>');
        checkExpr('span>{Hello world}', '<span>Hello world</span>');
        // checkExpr('span{Hello world}', '<span>Hello world</span>');
        checkExpr('span>{Hello}+{ world}', '<span>Hello world</span>');
        // checkExpr('span>{Click }+(a[href=/url/]{here})+{ for more info}', '<span>Click <a href="/url/">here</a> for more info</span>');
        // checkExpr('str{Text}', '<strong>Text</strong>');
        checkExpr("a>{test: }+span+span", "<a>test: <span></span><span></span></a>"); // new
        checkExpr("p>i.z+{0}+br+{1}", "<p><i class=\"z\"></i>0<br>1</p>"); // new
    });

    it("supports ES6 literals", function() {
        var bar = "foo";
        var emmet = DOM.emmetLiteral;

        expect(emmet`a+b`).toBe("<a></a><b></b>");
        expect(emmet`div>{${bar}}`).toBe("<div>foo</div>");
        expect(emmet`div>{${bar}}+(a>{${'bar'}})`).toBe("<div>foo<a>bar</a></div>");
    });

    it("should throw error on invalid args", function() {
        expect(function() { DOM.emmet({}); }).toThrow();
        expect(function() { DOM.emmet(it); }).toThrow();
        expect(function() { DOM.emmet(434); }).toThrow();
    });
});
