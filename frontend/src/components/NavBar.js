import React from 'react'
import { Link } from 'react-router-dom'
import auth from '../lib/auth'
import { withRouter } from 'react-router-dom'

class NavBar extends React.Component {

  constructor() {
    super()
    this.state = {
      navMobileOpen: false
    }
  }

  handleLogout() {
    auth.logout()
    this.props.history.push('/')
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setState({ navMobileOpen: false })
    }
  }

  render() {
    const isLoggedIn = auth.isLoggedIn()
    return <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <Link className="navbar-item" to="/">Home</Link>
            <a
              role="button"
              className={`navbar-burger burger ${this.state.navMobileOpen ? 'is-active' : ''}`}
              aria-label="menu"
              aria-expanded="false"
              onClick={() => this.setState({ navMobileOpen: !this.state.navMobileOpen })}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          <div className={`navbar-menu ${this.state.navMobileOpen ? 'is-active' : ''}`}>
            <div className="navbar-end">
              <div className="navbar-item">
                <Link className="navbar-item" to="/restaurants">Restaurants</Link>
              </div>

              {isLoggedIn && <div className="navbar-item">
                <Link className="navbar-item" to="/restaurant/new">Add a restaurant</Link>
              </div>}

              {!isLoggedIn && <div className="navbar-item">
                <Link className="navbar-item" to="/register">Register</Link>
              </div>}

              {!isLoggedIn && <div className="navbar-item">
                <Link className="navbar-item" to="/login">Login</Link>
              </div>}


              {isLoggedIn && <div className="navbar-item has-dropdown is-hoverable">

                <a className="navbar-link">
                  <Link className="navbar-item" to="/profile">{auth.getName()}</Link>
                </a>

                <div className="navbar-dropdown">
                  <a className="navbar-item">
                    <div
                      onClick={() => this.handleLogout()}
                      className="navbar-item dropdown-item"
                    >
                      Log out
                    </div>
                  </a>
                </div>

              </div>}


            </div>
          </div>
        </div>
      </nav>

    </>
  }
}

export default withRouter(NavBar)
// will need to be withRouter in future