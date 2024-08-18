"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = void 0;
const logoutController = (req, res) => {
    req.session.destroy((err) => {
        if (err)
            console.error(err);
        res.redirect("/");
    });
};
exports.logoutController = logoutController;
