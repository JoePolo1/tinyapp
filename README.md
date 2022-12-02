# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Important Disclaimer for New Users

***Until the next major patch, this project utilizes JavaScript objects as a database for user items as opposed to an external database. Shortened user URLs are only saved as long as the server is active. Restarting or disabling the host server will result in a loss of user data including the URL database and the User database.***

## Main Features

#### New User Registration

In order to access the features on this site, users must register and log in.

New users can access the site at the root page [http://localhost:8080/](http://localhost:8080/), however doing so will redirect them to the Login page. In order to register as a new user, click on the **Register** link in the header of the Login page or visit **[http://localhost:8080/register](http://localhost:8080/register)** directly. The user will be asked to input their email address and desired password and a new account will be generated, along with a cookie. 

If an email address is entered which already exists, users are advised and asked to login or choose another email address instead.

Passwords and cookies on this app are protected by hash encryption using the npm package **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**. Users are immediately logged into the site upon successful registration.

#### Logging In

Users may login at [http://localhost:8080/login](http://localhost:8080/login) using registered emails and passwords. 

Errors will result if:

- User attempts to log in using an email address that is not registered
- User inputs an incorrect password match

Upon login, the user email is displayed in the header. Client redirects to the URL index page at [http://localhost:8080/urls](http://localhost:8080/urls).

#### The Index Page

TinyApp's landing page for logged in users is an index page which consists of all shortened URLs created by that user.

**Note:** Users may only view links which they have created in the index. Users are unable to edit or delete any TinyApp shortened URLs which are not in their index. Anyone can access the shortened links to visit the long URL regardless of registration, provided they have the short link. 

From left to right on the Index Page columns:

- The shortened URL of existing TinyApp user links
- The long version of that URL
- An Edit button to edit existing links
- A Delete button to remove existing links permanently

#### Creating a New TinyApp URL

Users can create a new TinyApp shortened URL by selecting **"Create New URL"** in the header. This redirects to a page with a single input form asking users to enter the URL they wish to create a shortcut for. After doing so, clicking on submit initiates ***special internet magic*** in order to covert the long URL to a short URL, visible on the Edit page which they are redirected to as well as the Index page.

#### The Edit Page

The Edit page may be reached via the Index page by selecting edit on an index item, and is also accessible immediately following the creation of a URL. That is when typos occur, so we at TinyApp felt that it only made sense to include it there. If a destination URL has changed or a typo needs to be adjusted, the long version of the provided URL may be updated on this page. 

The user should enter the new URL or correction into the input form, and then click Submit. 

*Note that Edits made to the long URL do not change the TinyApp short URL. If you wish to change the short URL, please delete and recreate your link to receive a brand new randomly generated short link.*



