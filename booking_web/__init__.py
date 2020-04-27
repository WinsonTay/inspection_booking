from app import app
from flask import render_template, flash , url_for ,redirect
from booking_web.blueprints.users.views import users_blueprint

from flask_assets import Environment, Bundle
from .util.assets import bundles
# from flask_login import login_user , LoginManager , current_user

assets = Environment(app)
assets.register(bundles)
#Login manager init
# login_manager = LoginManager()
# login_manager.init_app(app)



# login_manager.login_view = "users.show,id=3"
# login_manager.login_message ="What The Hell"
app.register_blueprint(users_blueprint, url_prefix="/users")


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(401)
def not_authorized(e):
    return render_template('401.html'), 404

@app.route("/")
def home():
    return render_template('users/new.html')


