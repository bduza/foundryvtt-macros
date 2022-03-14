$('body').append(`<div id="custom-css" style="position: absolute; left: -1000;"><style>
#context-menu {
	z-index: 1000;
}
.chat-control-icon {
	display: none;	
}
img {
	border: none;
}
#chat-controls .roll-type-select {
	margin: 3.5px 1px 0px 1px;
	height: 20px;
}
#chat-form > textarea {
	height: 10px;	
}
#chat-form  {
	height: 30px;	
	flex-basis: 50px;
}
#chat-message textarea {
	min-height: 20px; !important;	
}
#chat-controls > div > a.export-log {
	margin-left: 3.5px;
}
.jlnk__entity-link {
	color: rgba(30, 30, 30, 0.8) !important;
	background: #DDD;
}
.dialog > .window-content * {
    color: rgba(255, 255, 255, 0.8) !important;;
}
.dialog > section  {
    background: unset ;
	background: rgba(30,30,30,0.5)  !important;
	background-blend-mode: multiply ;
    ;
}
.dialog > section > div.dialog-content > *  {
    color: rgba(255, 255, 255, 0.8) ;
	background:  rgba(30, 30, 30 ,1); /*!important ;*/
	//background: unset ;
}
.dialog > section > div.dialog-content  * > option {
    color: rgba(255, 255, 255, 0.8) ;
	background:  rgba(00, 00, 00 ,1); /*!important ;*/
	//background: unset ;
}
.dialog-button {
    color: rgba(255, 255, 255, 0.8) ;
}
.dialog > section > div.dialog-content  {
    color: rgba(255, 255, 255, 0.8) ;
}
.dialog-content > * > button  {
    color: rgba(255, 255, 255, 0.8) ;
	background:  rgba(30, 30, 30 ,0);
}
.dialog-content > form > *  {
    color: rgba(255, 255, 255, 0.8) ;
	background: rgba(30, 30, 30 ,1) ;
}
.dialog-button {
    color: rgba(255, 255, 255, 0.8) ;
}
.dialog > section > div.dialog-content  * {
    color: rgba(255, 255, 255, 0.8) ;
	background: rgba(30, 30, 30 ,0) ;
}
.dialog > section > * > button  {
    color: rgba(255, 255, 255, 0.8) ;
	background: --dialog-background ;
}
.dialog > footer > button {
    color: rgba(255, 255, 255, 0.8) ;
}
.dialog .inline-roll {
	color: #000;
}
.section-tab {
    color: rgba(255, 255, 255, 0.8) ;
	background: unset ;
	background:  rgba(130, 130, 130 ,1) !important;
	
}
section > * > input {
    color: rgba(255, 255, 255, 0.8) ;
}
.tox > *  {
    //color: rgba(255, 255, 255, 0.8) ;
	background:  rgba(255, 255, 255 ,1) !important ;
	//background: unset ;
}
/*
#hotbar-page-controls > a:nth-child(1) {
	display: none
}
#hotbar-page-controls > a:nth-child(3) {
	display: none
}
#hotbar-page-controls > span {
	margin-top: 1em;  
}
*/
#hotbar #macro-list {
    border: 1px solid #FFFFFF00;
	    flex: 0 0 523px;
}
.flexrow .macro-list {
    border: 1px solid #FFFFFF00;
}
.hotbar-page .macro-list {
	flex: 0 0 523px;
}
#hotbar .macro.inactive {
    box-shadow: 0 0 0px #444 inset;
}
.hotbar-page {
	transition: unset;
    width: 630px;
	bottom: 52px;
}
#hotbar {
    width: 600px;
	border-radius: 5px;
	bottom: 1px;
}
#hotbar .macro {
	margin: 0px 1px 2px 1px;
	position: relative;
    height: 50px;
    border: 1px solid #000;
    border-radius: 3px;
    background:  url(../ui/denim075.png);
    box-shadow: 0 0 10px #000;
    cursor: pointer;
	
}
#macro-list{
	grid-column-gap:2px;	
}
#hotbar .bar-controls {
	height: 50px;
	margin: 1px 0px 0px 1px;
	flex: 0 0 32px;
    text-align: center;
    color: #c9c7b8;
    background: url(../ui/denim075.png);
    border: 1px solid #000;
    box-shadow: 0 0 0px #444 inset;
    border-radius: 3px;
}
</style></div>`).hide();
