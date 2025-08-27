# SENSIA ADMIN DASHBOARD

&emsp;

SETUP DEMO: https://youtu.be/VDiCAE_oQSU

FUNCTIONALITIES DEMO: https://youtu.be/LmZMDKrpQZ0

&emsp;

## CHALLENGES FACED & SOLUTIONS
- I faced challenges with the file structure of Django within the backend folder wherein the directory was "backend/backend" which was not ideal. I was able to modify it to "backend/config" by changing some of entries in .py file based on research.
- I faced challenges with "CSRF cookies" which was weird because I was using JWT authentication but I was able to resolve it by not having a blank path in `url.py` file.
- I faced challenges with updating a page after an action, specifically with deleting comments, where it would fail to fetch the user data, not proceeding with deletion, and making the whole page blank. I resolved this bug by separation of concerns; fetch user data once the page loads and just update the states of the comments (update, delete, create, etc).
- I had confusion with the 4 permissions a bit based on the instructions. Having create, edit, and delete permissions would automatically require to have view permission to see the current user's comments. I tried an approach where if a user doesn't have view permissions but has create permissions, it would only show the user's comments but not other user's comments. Instead, I went for a simpler solution where view permission is required if any create, edit, or delete operations are to be granted. Nonetheless, view permission only means reading and seeing all comments.

&emsp;

## EXTERNAL RESOURCES USED
- I read over Stackoverflow articles when it comes to debugging with Django as well as their own documentation website.
- I used AI-powered chatbot assistants to further understand concepts in-depth and explore different approaches and solutions when it comes to debugging and implementing.

&emsp;

## HOW THE PROJECT MEETS THE GRADING CRITERIA
- When it came to the frontend, I sticked with just a simple and minimal theme with little to no animations. Since this is an admin dashboard, it would be beneficial for it to be quick, performant, and easy to use. The users table is present in the admin dashboard, built with reusable components, wherein it covers important details of the users such as their ID, full name, email address, quick summary of their permissions for each page, and an action column where the admin can change permissions from the get-go using checkboxes. In the comments section, reuable components were also utilized for every comment with the admin being able to see the full history of it such as who, when, and what changed.
- When it came to the backend, JWT authentication was implemented with an hour of maximum activity with persistent login based on local storage (renewed every login with JWT authentication). I did not go for the Groups feature, which came by default in Django, because with the current requirements such as users having different subsets of permissions for each page, it was more feasible to go for a custom model. Password recovery using OTP via email for users was also implemented with a free library called EmailJS.

&emsp;

## BACKEND SETUP

1. Redirect to backend folder
```
cd backend
```

2. Create a new python virtual environment
```
python -m venv venv
```

3. Load into the python virtual environment
```
# for macOS: source venv/bin/activate
# for Windows: source venv/Scripts/activate
```

4. Install libraries
```
pip install -r requirements.txt
```

5. Execute backend
```
python manage.py runserver
```

&emsp;

## FRONTEND SETUP

1. Redirect to frontned folder
```
cd frontend
```

2. Execute frontend
```
npm run dev
```
