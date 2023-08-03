const fs = require('fs/promises');

(async () => {
    try {
        const CREATE_FILE = "create a file";
        const DELETE_FILE = "delete a file";
        const RENAME_FILE = "rename a file";
        const ADD_TO_FILE = "add to a file";

        const createFile = async (path) => {
            try {
                const existingFileHandle = await fs.open(path, 'r');
                existingFileHandle.close();
                return console.log(`${path} already existed`)
            } catch (err) {
                const newFileHandle = await fs.open(path, 'w');
                console.log(`${path} created successfully`)
                newFileHandle.close()
            }
        }

        const deleteFile = async (path) => {
            try {
              await fs.unlink(path)
              console.log(`${path} deleted successfully`)
            } catch (err) {
                if(err.code === "ENOENT") {
                    console.log('No file at this path to delete')
                } else {
                    console.log('An error occurred')
                }
            }
        }

        const renameFile = async (oldPath, newPath) => {
            try {
                await fs.rename(oldPath, newPath)
                console.log(`File renamed successfully`)
            } catch (err) {
                if(err.code === "ENOENT") {
                    console.log('No file at this path to rename')
                } else {
                    console.log('An error occurred')
                }
            }
        }

        const addToFile = async (path, content) => {
            let fileHandle;
            try {
              fileHandle = await fs.open(path, 'a');
              fileHandle.write(content);
              console.log(`Content added successfully`)
            } catch (err) {
                console.log('An error occurred')
            }
            fileHandle.close();
        }

        const commandFileHandler = await fs.open('./command.txt', 'r');
        commandFileHandler.on('change', async (fileName) => {
                console.log(`${fileName} was changed`)
                const size = (await commandFileHandler.stat()).size;
                const buff = Buffer.alloc(size)
                const offset = 0
                const length = buff.byteLength
                const position = 0
                await commandFileHandler.read(buff, offset, length, position)
                const command = buff.toString('utf8')
                //create a file <path>
                if (command.includes(CREATE_FILE)) {
                    const filePath = command.substring(CREATE_FILE.length + 1)
                    createFile(filePath)
                }
                //delete a file <path>
                if (command.includes(DELETE_FILE)) {
                    const filePath = command.substring(DELETE_FILE.length + 1)
                    deleteFile(filePath)
                }
                //rename a file <path> to <new path>
                if (command.includes(RENAME_FILE)) {
                    const index = command.indexOf(' to ')
                    const oldPath = command.substring(RENAME_FILE.length +1, index)
                    const newPath = command.substring(index + 4)
                    renameFile(oldPath, newPath)
                }
                //add to a file <path> content: <content>
                if (command.includes(ADD_TO_FILE)) {
                    const index = command.indexOf(' content: ')
                    const filePath = command.substring(ADD_TO_FILE.length +1, index)
                    const content = command.substring(index + 10)
                    addToFile(filePath, content)
                }
        });
        const watcher = fs.watch('./command.txt')
        for await (const event of watcher) {
            if (event.eventType === "change") {
                commandFileHandler.emit('change', event.filename)
            }
        }
        } catch (err) {
            console.log('There was an error. Try again later')
        }
})()