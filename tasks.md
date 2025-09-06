# Tasks

1. Show Galleries by [id]
   - Data to show:
     - Gallery's metadata
     - Photos in a grid
       - A photo is clicked/tapped on > show photo in a lightbox with it's metadata on an overlay
   - 2 types:
     - Public
       - Allow anyone with the password can view the photos
     - Published
       - Shows a password page
       - Visitor enters the password
       - Visitor can view the gallery
   - Progress: WIP
2. Refactor passphrase function
   - Remove passphrase field from the main gallery form
   - A "Set Passphrase" button will appear next to the other buttons when the Status is changed to "PUBLISHED"
   - The "Set Passphrase" button will hide when the Status is changed to other values
   - When the "Set Passphrase" button is clicked/tapped, a "Set Passphrase" form will appear
     - Passphrase field
     - "Save" button
     - When the "Save" button is clicked/tapped, the SetGalleryPassphrase mutation is called
3. Edit photo's metadata
   - Right-click on photo
   - Show combo menu
   - Edit Metadata option
   - Shows a popup
   - Popup contains fields to edit the photo's metadata
   - Click save on the popup to update the photo's metadata
   - Progress: Not Started
