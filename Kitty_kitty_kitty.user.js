// ==UserScript==
// @name        Kitty kitty kitty
// @namespace   kittensgame
// @match        http://bloodrizer.ru/games/kittens/*
// @version      0.1
// @grant       none
// ==/UserScript==
var TabManager = function (name) {
    this.setTab(name);
};
TabManager.prototype = {
    tab: undefined,
    oldTab: undefined,
    render: function () {
        if (this.tab && game.activeTabId !== this.tab.tabId) this.tab.render();
        
        gamePage.activeTabId = this.tab.tabId;
        
        gamePage.render();

        return this;
    },
    setTab: function (name) {
        this.refreshTabs();
        this.oldTab = gamePage.activeTabId;

        for (var tab in gamePage.tabs) {
            if (gamePage.tabs[tab].tabId === name) {
                this.tab = gamePage.tabs[tab];
                break;
            }
        }

        this.tab ? this.render() : console.error('unable to find tab ' + name);
        this.refreshTabs();
    },
    revertTab: function(){
        this.setTab(this.oldTab);
    },
    // refreshTabs asks the game to redraw all the tabs.  We should run this frequently
    // to make sure we find all the new buttons
    refreshTabs: function(){
        for(var i = 0; i<gamePage.tabs.length;i++) {
			if(! /(stats|achievements)/i.test(gamePage.tabs[i].tabName)){
				gamePage.tabs[i].render();
			}
        }
    }
};

oRatios = { // YEAHHHHHHH
	'catnip': [
		0.999,
		'workshop',
		'wood',
		100
	],
	'wood': [
		0.999,
		'workshop',
		'beam',
		100
	],
	'minerals': [
		0.999,
		'workshop',
		'slab',
		100
	],
	'coal': [
		0.999,
		'workshop',
		'steel',
		20
	],
	'iron': [
		0.999,
		'workshop',
		'plate',
		20
	],
	'titanium': [
		0.999,
		'workshop',
		'alloy',
		10
	],
	// gold
	'oil': [
		0.999,
		'workshop',
		'kerosene',
		1
	],
	'manpower': [
		0.999,
		'manpower',
		'',
		'Auto hunted !'
	],
	'science': [
		0.999, 
		'workshop', 
		'compedium', 
		1
	],
	'culture': [
		0.999, 
		'workshop', 
		'manuscript', 
		1
	],
	'faith': [
		0.999,
		'religion',
		'',
		'Auto praised !'
	],
};
oThresholds = {
	'furs': [
		1750,	
		'workshop',
		'parchment',
		10
	],
    'parchment': [
        2500,
        'festival',
        '',
        'Auto organized festival !'
    ],
	'beam': [
		20000,
		'workshop',
		'scaffold',
		20
	],
	'unicorns' : [
		2500,
		'unicorns',
		'',
		'Auto sacrificed unicorns !'
	],
}


function handle_resource(oConfig, sResource){
	if(! $('#auto-' + sResource).prop("checked")){
		console.info('#auto-' + sResource + " not checked");
		return;
	}

    switch (oConfig[sResource][1]) {
        case 'workshop':
				if (oConfig[sResource].length >= 4 ) {
					oPrice = dojo.clone(gamePage.workshop.getCraft(oConfig[sResource][2]).prices);
					for (var i = oPrice.length - 1; i >= 0; i--) {
						oPrice[i].val *= oConfig[sResource][3];
					}

					if(gamePage.resPool.hasRes(oPrice)){
						gamePage.workshop.craft(oConfig[sResource][2], oConfig[sResource][3],  true);
						gamePage.msg(sResource + ' : auto craft ' + oConfig[sResource][3] + ' ' + oConfig[sResource][2] + ' !', 'craft');
					}
				}
            break;
        case 'manpower':
            $("a:contains('Send hunters')").click()
            gamePage.msg(oConfig[sResource][3]);
            break;
        case 'religion':
            gamePage.religion.praise();
            gamePage.msg(oConfig[sResource][3]);
            break;
        case 'unicorns':
            var oTabManager = new TabManager('Religion');

            if (oButton = gamePage.religionTab.sacrificeBtn){
                oButton.onClick()
                gamePage.msg(oConfig[sResource][3]);
            }

            oTabManager.revertTab();
            break;
        case 'festival':
            if(gamePage.calendar.festivalDays > 0 || ! gamePage.science.get("drama").researched){
                return;
            }
            
            gamePage.villageTab.festivalBtn.onClick();
            gamePage.msg(oConfig[sResource][2]);
            
            break;
        default:
            eval(oConfig[sResource][1]);
            gamePage.msg(oConfig[sResource][2]);
            break;
    }
}

function magic() {
    if (oObserve = document.getElementById('observeBtn')) {
        gamePage.msg('Auto observe !<br />')
        oObserve.click();
    }
    for (sResource in oRatios) {
        oCurrentResource = gamePage.resPool.get(sResource);
        if (oCurrentResource.value >= (oCurrentResource.maxValue * oRatios[sResource][0])) {
            handle_resource(oRatios, sResource);
        }
    }

    for (sResource in oThresholds) {
        oCurrentResource = gamePage.resPool.get(sResource);
        if (oCurrentResource.value >= oThresholds[sResource][0]) {
            handle_resource(oThresholds, sResource);
        }
    }
}
window.setInterval(magic, 1000);

// $('#rightColumn').width('33%')
$('#rightColumn').after('<div id="switchescolumn" style="width:200px;position:absolute;right:20px;top:20px;"></div>');
$('#switchescolumn').append('<ul>')
$('#switchescolumn').append('<li><label for="auto-all">Auto all</label><input type="checkbox" id="auto-all" onclick="$(\'#switchescolumn input\').each(function(o){$(this).prop(\'checked\', $(\'#auto-all\').prop(\'checked\'));});" /></li>');
for (sResource in oThresholds) {
	$('#switchescolumn').append('<li><label for="auto-' + sResource + '">Auto ' + sResource + ' usage</label><input type="checkbox" id="auto-' + sResource + '" /></li>');
}
for (sResource in oRatios) {
	$('#switchescolumn').append('<li><label for="auto-' + sResource + '">Auto ' + sResource + ' usage</label><input type="checkbox" id="auto-' + sResource + '" /></li>')
}
$('#switchescolumn').append('</ul>')
