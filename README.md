### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png) General Assembly, Software Engineering Immersive
# Food For Thought
- <img src="https://i.imgur.com/fgRHqp8.png" width="650"/>

by [Denise Cheung](https://github.com/denisecheung3), [Emma Hobday](https://github.com/emmahobday), [Ben Harris](https://github.com/benharris8) & [Subash Limbu](https://github.com/)

## Table of contents
1. [Brief](#Brief)
2. [Technologies Used](#Technologies-Used)
3. [Approach](#Approach)
    - [Homepage](#Homepage)
        - [The random restaurant feature](#The-Random-Restaurant-Feature) 
        - [The email restaurant information feature](#The-email-restaurant-information-feature)
    - [View All Restaurants Page](#View-All-Restaurants-Page)
    - [The Single Restaurant Page](#The-Single-Restaurant-Page)
        - [The email restaurant information feature](#The-email-restaurant-information-feature)
        - [Displaying a map of where the restaurant is](#Mapbox)
    - [Add a restaurant page](#Favourites)
    - [Favourites page](#Favourite-restaurant(s)-page)
        - [The Favouriting restaurants feature](#The-Favouriting-restaurants-feature)  
    - [The user profile page](#The-user-profile-page)
        - [The changing password feature](#The-changing-password-feature)
    - [Others](#Others)
        - [Auto Logout When Token Expires](#Auto-Logout-When-Token-Expires)

4. [Screenshots](#Screenshots)
5. [Potential Future Features](#Potential-future-features)
6. [Bugs](#Bugs)
7. [Lessons learnt](#Lessons-learnt)

## Brief 
* Work in a team, using **git to code collaboratively**.
* **Build a full-stack application** by making your own backend and your own front-end
* **Use an Express API** to serve your data from a Mongo database
* **Consume your API with a separate front-end** built with React
* **Be a complete product** which most likely means multiple relationships and CRUD functionality for at least a couple of models

## Technologies Used
- CSS
- HTML
- JavaScript (ES6)
- React.js
- Node.js 
- Express
- Mocha and Chai
- React Map GL (Mapbox)
- Postcode.io API 
- Node MailJet 
- Mongo and Mongoose
- Multer, GridFs
- Moment
- Git and GitHub
- Bulma
- Google Fonts


### Homepage
#### The Random Restaurant Feature 

- Backend: added a new route to router.js 
     ```js
        router.route('/random')
          .get(restaurantController.getRandomRestaurant)
     ```

- Backend: wrote a function getRandomRestaurant in restaurantController.js 
     ```js
        function getRandomRestaurant(req, res) {
          const currentUser = req.currentUser
          Restaurant
          .find()
          .distinct('_id') //get only the ids of all the restaurants as an array
          .then(restaurants => {
            const arrayofRestaurantIds = restaurants
            const randomNumber = Math.floor((Math.random() * arrayofRestaurantIds.length))
            const idOfOneRandomRestaurant = arrayofRestaurantIds[randomNumber]
            return idOfOneRandomRestaurant
          })
          .then(singleRestaurantId => {
            Restaurant
              .findById(singleRestaurantId)
              .then(restaurant => {
                return res.send(restaurant)
              })
              .catch(err => res.send({ error: err }))
          })
        }
     ```
     - Originally I had the above code but a day later I went back to look at it and realised that I was doing an extra unnecessary step. 
     - In the function I first looked for all the restaurant documents. Then I use the mongoose distinct method to get an array of RestaurantIds and then get the Id of a random restaurant. Using this id, I look for the restaurant using the mongoose findById method and then send back the restaurant. However, I could have made my code more concise - first find all the restaurant documents, then get a random restaurant, and send it back: 

     ```js
        function getRandomRestaurant(req, res) {
          Restaurant
            .find() 
            .then(arrayofAllRestaurants => {
              const randomNumber = Math.floor((Math.random() * arrayofAllRestaurants.length)) //generate random number
              return res.send(arrayofAllRestaurants[randomNumber]) //returns a random restaurant
            })
            .catch(err => res.send({ error: err }))

        }
     ```
     - <img src="https://i.imgur.com/fgRHqp8.png" width="450"/>
     - Once the user clicks on the 'GAMBLE' button, it will get a random restaurant and redirect the user to that restaurant's page with all the information about the restaurant. 


### View All Restaurants Page

### The Single Restaurant Page
#### The email restaurant information feature 
- This is a feature available to logged in users. When the user discovers a restaurant he/she likes, they can click on the 'email restaurant info to me!' button, and they will receive an email with the restaurant's information. 

- Backend: added a new route /restaurant/:id/email in our router.js
  - It was really important to use :id so that we were about to use react router's parameters (req.params.id), so that the restaurant's id is available to us.
     ```js
     router.route('/restaurant/:id/email')
        .get(secureRoute, restaurantController.emailRestaurantInfo)
     ```

- Backend: wrote the function emailRestaurantInfo in restaurantController.js 
  - First I made an account with MailJet to get our API keys.
  - Then I followed MailJet's [documentation](https://github.com/mailjet/mailjet-apiv3-nodejs#make-your-first-call). I made changes to the email template we would send, to ensure that the email goes to the logged in user's registered email address, and the information contained in the email was the restaurant the user was viewing. Here is a snippet of the function emailRestaurantInfo: 
  
     ```js
        function emailRestaurantInfo(req, res) {
          const currentUser = req.currentUser
          const mailjet = require('node-mailjet')
            .connect(process.env.MJ_API_KEY1, process.env.MJ_API_KEY2)
          Restaurant
            .findById(req.params.id)
            .then(restaurant => {
              const veggieFriendly = restaurant.veggieFriendly ? '✅' : '❌'
              const serveAlcohol = restaurant.serveAlcohol ? '✅' : '❌'
              const request = mailjet
                .post("send", { 'version': 'v3.1' })
                .request({
                  "Messages": [
                    {
                      "From": {
                        "Email": "foodforthought0987@gmail.com",
                        "Name": "FoodForThought"
                      },
                      "To": [
                        {
                          "Email": `${currentUser.email}`,
                          "Name": `${currentUser.username}`
                        }
                      ],
                      "Subject": "Restaurant you are interested on FoodForThought",
                      "TextPart": "Email from FoodForThought",
                      "HTMLPart": `<h3> Thank you for using FoodForThought. Please find the restaurant information as requested. </h3> <br /> <img src="${restaurant.image}" style="max-width:400px"/> <br /> Name of restaurant: ${restaurant.name} <br /> Cuisine: ${restaurant.cuisine[0]} <br /> Restaurant link: ${restaurant.link} <br /> Address: ${restaurant.address} <br /> Postcode: ${restaurant.postcode} <br /> Telephone: ${restaurant.telephone} <br /> Veggie friendly: ${veggieFriendly} <br /> Serves alcohol: ${serveAlcohol} `

                    }
                  ]
                })
     ```
  - The function emailRestaurantInfo is called whenever the logged-inuser clicks on the 'email restaurant info to me!' button on the frontend. Here is a sample email that the user receives: 
       - <img src="https://i.imgur.com/AVexuvI.png" width="450"/>
       

- Frontend: Email component 
  - I created a functional component that uses hooks. The Email component is inserted as a conditional component within the singleRestaurant component (which is the page that shows the information of a specific restaurant), so only logged in users are able to use the favouriting feature. 
  - <img src="https://i.imgur.com/6pQ3JRa.png" width="650"/>

  - When the user clicks on the 'email restaurant info to me!' button, the function handleEmailRestoInfo() is called. This function makes a request to the /api/restaurant/${id}/email endpoint and the backend endpoint sends the email (as explained earlier). If the endpoint returns resp.data (which is a 'email sent succesfully' string), it will set this message to state. If there is an error, it will set the error message ('email not sent succesfully, please contact administator') to state. The purpose of this is so that the appropriate message could be displayed to the user after he/she clicks on the email me button.
     ```js
              function handleEmailRestoInfo() {
                axios.get(`/api/restaurant/${id}/email`, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
                  .then((resp) => {
                    setMessage(resp.data)

                  })
                  .catch(err => {
                    setMessage(err)
                  })

              }
     ```
  - <img src="https://i.imgur.com/0uLERaq.png" width="250"/> 
  

#### Displaying a map of where the restaurant is using [React Mapbox](https://github.com/uber/react-map-gl)
- The Singlerestaurant component renders a Map component amongst other things
- When the Map component mounts, it will make an API call to an external postcode API to convert the restaurant’s postcode into lattitude and longitude. 
- Using the lat and long, I then render a ReactMapGL component (that I have access to because I imported the ReactMapGL library)
- Rendering the map was a bit fiddly but the documentation and the examples really helped 
- This is a sample map generated that's displayed on our single restaurant page for 'Orient' restaurant: 
    - <img src="https://i.imgur.com/p2GQFEO.png" width="300"/>

### The user profile page  
- This is the page where a logged in user can view his/her profile. It displays the user's username and user name email. It is also where the user is able to change his/her password using the change password function (which will be dicussed below, in another section). 

- Backend: added a new route /profile in our router.js
  - It was really important to use :id so that we were about to use react router's parameters (req.params.id), so that the restaurant's id is available to us.
     ```js
      router.route('/profile')
        .get(secureRoute, userController.getProfile)
     ```

- Backend: wrote the function getProfile in userController.js 
  - It's a very simple function that returns the logged in user (which is an object) 
       ```js
        function getProfile(req, res) {
          const user = req.currentUser
          res.status(202).send(user)
        }
     ```
  - The function getProfile is called when the logged-inuser clicks on his/her username on the navbar. Here is a screenshot of a sample profile page: 
       - <img src="https://i.imgur.com/lYKtkmp.png" width="450"/>  
- the /profile backend endpoint proves very useful for the favouriting restaurant feature, discussed later on. 


### Favourite restaurant(s) page 
#### Favouriting restaurants feature 
- This is a feature available to logged in users. When the user discovers a restaurant he/she is interested in, they can click on the 'favourite' button and the restaurant will be added to their list of favourited restaurants. The user can view their list of favourited restaurants by clicking on the 'favourites' tab on the navbar. 

- Backend (to favourite/unfavourite a restaurant): added a 'favourites' field (which would be an array), to our User schema.
  - The elements in this array would be the ids of the restaurants that the user has favourited. It is a reference relationship to the Restaurant model. 

     ```js
      const schema = new mongoose.Schema({
        favourites: [{ type: mongoose.Schema.ObjectId, ref: 'Restaurant', required: false }]
        ... among other things 
      })
     ```

- Backend (to favourite/unfavourite a restaurant): added two new routes to our router.js
     ```js
        router.route('/restaurant/favourite')
          .put(secureRoute, userController.favourite)

        router.route('/restaurant/unfavourite')
          .put(secureRoute, userController.unfavourite)
     ```
  - Initially, I added these routes to the end of the router.js document. When I tested this endpoint in insomnia, it was unexpectedly returning an empty array. I discovered that it was because I had a route router.route('/restaurant/:id') defined earlier. This meant that my 'favourite' in /restaurant/favourite was a 'wildcard', and being caught by :id in /restaurant/:id. To solve this problem, I moved my /restaurant/favourite and /restaurant/unfavourite routes up my router.js and defined them before /restaurant/:id. 


- Backend (to favourite/unfavourite a restaurant): wrote the function favourite and the function unfavourite in userController.js 
  - function favourite 
     ```js
        function favourite(req, res) {
          const user = req.currentUser
          User
            .findOne(user)
            .then(user => {
              user.favourites.push(req.body.restaurantId)
              return user.save()
            })
            .then(() => {
              res.status(200).send({ message: 'added restaurant to user favourites field/array' })
            })
            .catch(error => res.send({ errors: error.errors })) 
        }
     ```
     - This function finds the logged in user who is trying to favourite a restaurant, then pushes the restaurant in question's id into user's favourite field (in User's schema), then saves the User to save the updated changes. 
     - Initially, although I was able to succesfully push the restaurantId to the user's favourites fields, I was unable to save the updated User. I was getting the following error in the console [SCREENSHOT]. 
     - With some help from my instructor, we discovered that an error was thrown because it was trying to validate the password. Since no password was given, the error returned was 'Password must be at least 8 characters long...' etc. To tackle this, I added a condition to only validate my password if the password is modified in my User schema: 
     ```js
        schema
          .pre('validate', function checkPassword(next) {
            if (this.isModified('password')) {
              const validationResult = passwordComplexity().validate(this.password)
              if (validationResult.error) {
                this.invalidate('password', 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.')
              }
              if (this._passwordConfirmation !== this.password) {
                this.invalidate('passwordConfirmation', 'passwords should match')
              }
            }
            next()
          })
     ```
- function unfavourite 
     ```js
        function unfavourite(req, res) {
          const user = req.currentUser
          User
            .findOne(user)
            .then(user => {
              user.favourites.pull(req.body.restaurantId)
              user.save()
              res.status(200).send({ message: 'removed restaurant from users favourites array' })
            })}
        }
     ```
     - This function does exactly the opposite of function favourite. It finds the logged in user who is trying to unfavourite a restaurant, then removes the restaurant in question's id from user's favourite field (in User's schema), then saves the User to save the updated changes. 

- Backend (view a user's favourited restaurant): added a new route to router.js 
     ```js
        router.route('/favourites')
          .get(secureRoute, userController.getFavourites)
     ```

- Backend (view a user's favourited restaurant): wrote a function getFavourites in restaurantController.js 
     ```js
        function getFavourites(req, res) {
          const currentUser = req.currentUser
          Restaurant
            .find({ '_id': { $in: currentUser.favourites } })
            .then(favRestos => {
              res.status(200).send(favRestos)
            })
        }
     ```
     - This function looks into the Restaurant collection and finds a list of restaurant with the id that corresponds to the restaurantIds inside the user's favourites field, then sends the restaurants (the restaurants are objects). 

Frontend: FavouriteButton component (FavouriteButton.js)
  - I created a new class component FavouriteButton. The FavouriteButton is inserted as a conditional component within the singleRestaurant component (which is the page that shows the information of a specific restaurant), so only logged in users are able to use the favouriting feature. 
  - <img src="https://i.imgur.com/QpLVfKM.png" width="450"/>
  - When the FavouriteButton component mounts, it will first check if the user is logged in. If yes, it will then make a call to /api/profile which returns the user object of the logged-in user, including the favourites field. 
   - <img src="https://i.imgur.com/4qAz24r.png" width="650"/>

  - Once we have the user's favRestoArray, I check whether the array includes the id of the restaurant viewed (this id is passed down as a prop by the parent component, singleRestaurant). If it does, we set this.state.isFavourited to true, if not, we set this.state.isFavourited to false. This is really important because this affects whether the favouriteButton is rendered with a filled-in star (indicating that the user has already favourited the restaurant) or an empty-start (user has not yet favourited the restaurant).
     ```js
        componentDidMount() {
          const isLoggedIn = auth.isLoggedIn()
          isLoggedIn && axios.get('/api/profile',
            { headers: { Authorization: `Bearer ${auth.getToken()}` } }
          )
            .then(resp => {
              const favedRestoArray = resp.data.favourites
              if (favedRestoArray.includes(this.props.restaurantId)) {
                this.setState({ isFavourited: true })
              } else {
                this.setState({ isFavourited: false })
              }
            })
        }
     ```

     ```js
        render() {
          return <button className="button is-normal" onClick={(event) => this.handleFavouriteButton(event)}>
            <FontAwesomeIcon icon={this.state.isFavourited ? faStar : faStarEmpty} />
            {'Favourite'}
          </button>

        }
      }
     ```
  - When the user clicks on the favourite button, the function handleFavouriteButton will be called. 
     ```js
        handleFavouriteButton(event) {
          const { restaurantId } = this.props
          event.preventDefault()
          if (!this.state.isFavourited) {
            axios.put('/api/restaurant/favourite',
              { restaurantId },
              { headers: { Authorization: `Bearer ${auth.getToken()}` } })
              .then(() => this.setState({ isFavourited: true }))
              .catch(err => console.log(err))
          } else {
            axios.put('/api/restaurant/unfavourite',
              { restaurantId },
              { headers: { Authorization: `Bearer ${auth.getToken()}` } })
              .then(() => this.setState({ isFavourited: false }))
              .catch(err => console.log(err))
          }
        }
     ```
    - If !this.state.isFavourited (i.e resto is NOT faved, meaning now user is favouriting it), we hit the endpoint /api/restuarant/favourite and, as explained above, it will take req.body.restaurantId and push it to the user's favourited array. After this, we will set this.state.isFavourited to true, so that the star will appear to be filled in on user's screen. 
       - <img src="https://i.imgur.com/q9odD14.png" width="650"/>
    - If this.state.isFavourited (i.e resto is already faved, meaning now user is unfavouriting it), we will do the opposite. 

Frontend: Viewing list of favourited restaurant on the frontend 
    - The user can view their list of favourited restaurants by clicking on the 'favourites' tab on the navbar. This will render the FavouritedRestaurants component. 
    - When the FavouritedRestaurants component mounts, it makes a request to the /api/favourites endpoint to get the list of the user's favourited restaurants, then sets this.state.favouritedRestos with the response data. Afterwards, the render function maps over this.state.favouritedRestos to render a restaurant card for each of the user's favourited restaurant: 
        - <img src="https://i.imgur.com/kkYaehx.png" width="650"/>

### Others
#### Auto Logout When Token Expires
- Problem we faced: after our token expires, the frontend will still appear as if we have logged in. this was confusing as when we tested members-only feature, we ran into unauthorised errors. 
- To solve this, we decided to log the user out when they try to use our page after the token has expired.

- In auth.js we added two additional functions to complement the existing getToken()function 
     ```js
        function getToken() {
          return localStorage.getItem('token')
        }

        function getPayload() {
          const token = this.getToken() 
          if (!token) return false
          const parts = token.split('.')
          if (parts.length < 3) return false
          return JSON.parse(atob(parts[1]))
        }

        function isAuthenticated() {
          const payload = this.getPayload()
          if (!payload) return false
          const now = Math.round(Date.now() / 1000)
          return now < payload.exp  
        }
     ```
     - The function isAuthenticated() will return true if the token is present and is valid (i.e not expired) and false if the token is present but invalid (i.e expired). 
     
- On the frontend we added two functional components: CustomRoute.js and SecureRoute.js
    - CustomRoute: this is for endpoints that are available to both non-members and member. If the user is trying to go to page that hits a public endpoint, but their token has expired, it will log them out then take them to the page: 
    
     ```js
        const CustomRoute = (props) => {
            if (!Auth.isAuthenticated()) Auth.logout() //logs you out if you're not authenticated
            return <Route {...props} />
        }
     ```
    - SecureRoute: this is for endpoints that are available to members only. If the user is trying to go to a page that hits a private endpoint, but their token has expired, it will log them out and **redirect** them to the login page: 
     ```js
            const SecureRoute = (props) => {
              if (Auth.isAuthenticated()) return <Route {...props} />
              Auth.logout()
              return <Redirect to="/login" />
            }
        }
     ```
    - We then imported CustomRoute and SecureRoute into our frontend app.js, and change the Route to either SecureRoute or CustomRoute depending on whether that page hits a private endpoint. A code snippet of this:
     ```js
          <SecureRoute exact path="/restaurant/new" component={AddRestaurant} />
          <CustomRoute exact path="/" component={Home} />
     ```
## Screenshots 
- Homepage 
    - <img src="https://i.imgur.com/fgRHqp8.png" width="650"/>
    
- All restaurants page 
    - <img src="https://i.imgur.com/ZITUpSs.png" width="650"/>
    
- Single restaurant page
    - <img src="https://i.imgur.com/2aKJTbR.png" width="650"/>

- Add a restaurant page 
    - <img src="https://i.imgur.com/NvYRoJp.png" width="650"/>
    
- Profile page 
    - <img src="https://i.imgur.com/lYKtkmp.png" width="450"/> 
    
- Favourites page  
    - <img src="https://i.imgur.com/kkYaehx.png.png" width="650"/>
    
- Register page 
    - <img src="https://i.imgur.com/FLRiCJD.png" width="650"/> 

- Login page 
    - <img src="https://i.imgur.com/3PeqBWS.png" width="650"/> 


## Potential Future Features
- A 'Suggested restaurants' feature for logged-in users. It could show top 5 other similar restaurants based on price range, location and cusine, or 'users who liked this restaurant also liked....' list of restaurants. 
- Logged-in users to upload images of their visit to a particular restaurant (e.g: photo of the restaurant environment or the food they had at that restaurant) 
- Improve the accuracy of the map - currently I am getting the latitude and longitude by converting a postcode, which doesn't give the exact accurate location of the restaurant. Some research could be done to find a way to get long and lat using first line of address and postcode in order to get precise location on a map.

## Bugs 
- No known bugs at the moment but please let us know if you experience any so we can fix them ASAP

## Lessons Learnt 
- It helps to re-read your code after some time has passed as you come back with a fresh pair of eyes and may be able to refactor it. 
- A little CSS goes a long way. Don't underestimate the power of CSS as it really helped our website come across as a lot more professional and highlighted the features our website offers.
- Before we focused on CSS: 
    - <img src="https://i.imgur.com/x26VNCV.png" width="650"/>
- After we worked on our CSS 
    - <img src="https://i.imgur.com/fgRHqp8.png" width="650"/>
