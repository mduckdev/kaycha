"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileController = void 0;
const profileController = (req, res) => {
    res.render("profile", { user: req.session.user, csrfToken: req.session.csrfToken });
};
exports.profileController = profileController;
