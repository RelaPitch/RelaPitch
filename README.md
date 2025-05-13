# RelaPitch

RelaPitch is a web application designed to help users learn and practice relative pitch.

## Prerequisites

- Python 3.x
- pip (Python package installer)

## Setup and Running the Application

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd RelaPitch
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    # On macOS and Linux
    python3 -m venv venv
    source venv/bin/activate

    # On Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Flask application:**
    ```
    python server.py
    ```

5.  **Open your web browser and navigate to:**
    [http://127.0.0.1:5001/](http://127.0.0.1:5001/)

## Project Structure

-   `server.py`: The main Flask application file containing routes and logic.
-   `static/`: Contains static assets like CSS, JavaScript, and images.
    -   `css/`: Stylesheets for the application.
    -   `js/`: JavaScript files for client-side interactions.
-   `templates/`: HTML templates rendered by Flask.
-   [requirements.txt](cci:7://file:///Users/fabianzuluagazuluaga/Desktop/Columbia/UI%20Design/HW/HW12/RelaPitch/requirements.txt:0:0-0:0): Lists the Python dependencies for the project.
-   [README.md](cci:7://file:///Users/fabianzuluagazuluaga/Desktop/Columbia/UI%20Design/HW/HW12/RelaPitch/README.md:0:0-0:0): This file, providing information about the project.

## Contributing

[Details on how to contribute to the project, if applicable.]

## License

[Specify the license for your project, e.g., MIT License.]