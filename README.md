# Quack Time – Productivity Assistant 🦆⏳

## Overview  
Quack Time is a web application designed to enhance productivity by implementing the **Pomodoro time-management technique**. The system helps students break work into focused **25-minute sessions** followed by short breaks, allowing for better time management and improved productivity.  

This project was developed as part of **CS 422 Software Engineering Project 2** at the University of Oregon. It provides a structured task board system that lets users categorize tasks, track remaining work, and log their productivity ratings.

## Features  
✅ **Pomodoro Timer** – Work in structured 25-minute intervals with breaks.  
✅ **Task Boards** – Organize assignments and projects into categories (e.g., "CS 422", "ENG 208").  
✅ **ProDUCKtivity Log** – Track your progress and analyze productivity trends.  
✅ **User Authentication** – Secure login system via DuckID.  
✅ **Cloud Storage** – Saves user tasks and logs on a MySQL database for access from multiple devices.  
✅ **Custom Timer** – Users can set custom work intervals beyond Pomodoro's standard 25 minutes.  

## Installation & Setup  

### Prerequisites  
- **Python 3.12+**  
- **MySQL** database installed and running  
- **Required Dependencies:**  
  ```bash
  pip install bcrypt Flask mysql-connector-python
  ```

### Running the Application  

#### macOS / Linux  
```bash
cd path/to/quack-time
python3 app.py
```
Open [localhost:5002](http://localhost:5002) in your browser.

#### Windows  
```bash
cd path\to\quack-time
python app.py
```
Then, visit [localhost:5002](http://localhost:5002).

### Directory Structure  
```
/quack-time
│-- README.md                   # This file
│-- SRS.pdf                      # Software Requirements Specification
│-- SDS.pdf                      # Software Design Specification
│-- Project_Plan.pdf             # Project planning and timeline
│-- Programmer_Documentation.txt # Internal documentation for developers
│-- Installation_Instructions.pdf # Step-by-step setup guide
│-- User_Documentation.pdf        # Guide for end-users
│-- Quack Time/
│   └-- app.py                   # Main application file
│   └-- db.py                     # Handles database connections
│   └-- static/
│       └-- css/                 # Stylesheets
│       └-- js/                  # JavaScript logic
│       └-- images/              # UI graphics
│   └-- templates/               # HTML templates
```

## Usage  

1⃣ **Login or Sign Up** using DuckID.  
2⃣ **Create Task Boards** for different courses or projects.  
3⃣ **Add Tasks** with estimated completion times.  
4⃣ **Start a Timer** using Pomodoro or a custom session.  
5⃣ **Rate Productivity** after each session (1-5).  
6⃣ **Review Logs** to analyze work trends.  

## Authors ✨  
- **Neal Kimchi**  
- **Nikhar Ramlakhan**  
- **Areyan Rastawan**  
- **Abie Safdie**  

📅 **Developed: Spring 2024**  
📝 **Course: CS 422 Software Engineering**  

## License  
This project was created for academic purposes. License and further distribution rights TBD.
