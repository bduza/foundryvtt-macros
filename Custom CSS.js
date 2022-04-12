if ($('#custom-css').length) return $('#custom-css').remove();
else
$('body').append(`<div id="custom-css" style="position: absolute; left: -1000;"><style>
.editor-content {
  font-size: 120%;
}
img {
	border: none;
}
.chat-message {
  background: #111;
  color: white;
  border: 1px solid #555;
}
.chat-message.whisper {
  background: #111;
  border: 1px solid blue;
}
.chat-message.whisper.blind {
  background: #111;
  border: 1px solid red;
}
.chat-message * {
  background: #111;
  color: white;
}
.dice-roll {
 position: relative;
}
.dice-formula, .dice-total, .dice-rolls {
  
  background: unset !important;
  /*text-align: left !important;
  justify-content: left !important;*/
}
.dice-formula, .dice-total {
border: 1px solid black !important;
  box-shadow: 0 0 2px #555 inset !important;
}
.dice-total {
  /*position: absolute; 
  height: 0px;
  bottom: 1em; 
  right: -5em;
  font-size: 2em !important;*/
}
.dice-result {
}
.dice-tooltip {
  display: inline !important;
}
.message-sender {
  /*text-align: center;*/
  color: white;
}
.message-metadata * {
  /*display: none;*/
  color: #999;
}
.message-metadata i{
  /*display: none;*/
  color: #DD0000;
}
.flavor-text{
  background: unset;
  color: white;
  /*text-align: center;*/
  /*font-size: 1.1em !important;*/
}
.chat-control-icon {
	display: none;	
}
#chat-controls .roll-type-select  {
	margin: 3.5px 1px 0px -2px;
	height: 20px;
	background: #111;
  color: white ;
}
#chat-controls .roll-type-select * {
	background: #111;
}
#chat-form  {
	height: 30px;	
	flex-basis: 50px;
}
textarea#chat-message  {
	min-height: 20px !important;	
	background: #111;
  color: white ;
  border: 1px solid #aaa;
  margin-left: -2px;
}
#chat-controls > div > a.export-log {
	margin-left: 3.5px;
	color: white
}
.jlnk__entity-link {
	color: rgba(30, 30, 30, 0.8) ;
	background: #DDD;
}
.dialog > .window-content * {
    color: rgba(255, 255, 255, 1) ;
}
.dialog > section  {
    background: unset ;
	background: rgba(30,30,30,0.5)  !important;
	background-blend-mode: multiply ;
    ;
}
.dialog > section > div.dialog-content > *  {
    color: rgba(255, 255, 255, .9) ;
	background:  rgba(30, 30, 30 ,1); /*!important ;*/
	//background: unset ;
}
.dialog > section > div.dialog-content  * > option {
    color: rgba(255, 255, 255, .9) ;
	background:  rgba(00, 00, 00 ,1); /*!important ;*/
	//background: unset ;
}
.dialog-button {
    color: rgba(255, 255, 255, .9) ;
}
.dialog > section > div.dialog-content  {
    color: rgba(255, 255, 255, .9) ;
}
.dialog-content > * > button  {
    color: rgba(255, 255, 255, .9) ;
	background:  rgba(30, 30, 30 ,0);
}
.dialog-content > form > *  {
    color: rgba(255, 255, 255, .9) ;
	background: rgba(30, 30, 30 ,1) ;
}
.dialog-button {
    color: rgba(255, 255, 255, .9) ;
}
.dialog > section > div.dialog-content  * {
    color: rgba(255, 255, 255, .9) ;
	background: rgba(30, 30, 30 ,0) ;
}
.dialog > section > * > button  {
    color: rgba(255, 255, 255, .9) ;
	background: --dialog-background ;
}
.dialog > footer > button {
    color: rgba(255, 255, 255, .9) ;
}
.dialog .inline-roll {
	color: #000;
}
.section-tab {
    color: rgba(255, 255, 255, .9) ;
	background: unset ;
	background:  rgba(130, 130, 130 ,1) !important;
	
}
section > * > input {
    color: rgba(255, 255, 255, .9) ;
}
.tox > *  {
    //color: rgba(255, 255, 255, .9) ;
	background:  rgba(255, 255, 255 ,1) !important ;
	//background: unset ;
}
/*
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
*/
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
</style></div>`)
$('#custom-css').hide();