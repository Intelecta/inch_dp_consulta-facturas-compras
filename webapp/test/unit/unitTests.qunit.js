/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"inch_dp_consulta-facturas-compras/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
