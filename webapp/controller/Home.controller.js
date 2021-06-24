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

				ZLTDBM_CONCESIONARIO_SRV.read("/facturaSet", {
					success: function (result) {
						console.log(result.results);
					},
					error: function (err) {
						console.log(err);
					}
				});

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
