sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("inch_dp_consulta-facturas-compras.controller.Home", {
			onInit: function () {

				var ZLTDBM_CONCESIONARIO_SRV = this.getOwnerComponent().getModel("ZLTDBM_CONCESIONARIO_SRV");

				this.byId("vbox").setModel(ZLTDBM_CONCESIONARIO_SRV);

				$.ajax("user-api/currentUser", {
					type: "GET",
					async: false,
					dataType: "json",
					success: function (response) {
						console.log(response);
					},
					error: function (error) {
						MessageToast.show("No se ha podido obtener los datos del usuario");
					}
				});

			}
		});
	});
