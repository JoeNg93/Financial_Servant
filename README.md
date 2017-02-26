# Financial_Servant

This project is my personal project. The motivation for this project is that I need an application that can help me to control my spending.

This project is currently in development. New features will be added in the near future.

Because I am the only one who use this application so my data will be store in .json file. In addition, my application also has a login feature (using salt hash authentication method) in order to scale it to multiple users in the future.

## Getting Started

### Technologies
- Bootstrap and normal CSS for UI
- Express for Back-End
- JSON for saving data

### Installing
Clone the project
```
git clone https://github.com/JoeNguyen93/Financial_Servant.git
```

Install package dependencies
```
npm install
```

Create your own **user_accs.json** file in the same directory with **app.js**
```
[
  {
    "username": "your_user_name",
    "salt": "your_salt_generated_randomly",
    "password": "your_password_after_hashing_and_combining_with_salt"
  }
]
```

Delete everything inside **money_spent.json**

## Demo
### Login 
![Login](./demo/Login.gif)

### Change Category
![Change Category](./demo/Change_Category.gif)

### Add New Spending
![Add Spending](./demo/Add_Spending.gif)

### Logout
![Logout](./demo/Logout.gif)
