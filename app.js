const fs = require('fs');
const dirTree = require('directory-tree');
const http = require('http');

const formidable = require('formidable');
const mv = require('mv');

const ROOT_PATH = process.argv[2];
const PORT = process.argv[3] || 6969;
const sliceLength = ROOT_PATH.length;

//var root = dirTree(ROOT_PATH);
//root.children.forEach((child) => {
//    console.log(child.path.slice(9));
//});

http.createServer(function(req, res) {
	if (req.method == 'POST') {
		console.log(req.url);
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			console.log('uploading');
			var oldpath = files.fileToUpload.path;
			var newpath = ROOT_PATH + decodeURI(req.url) + files.fileToUpload.name;
			console.log(newpath);
			mv(oldpath, newpath, function(err) {
				if (err) {
					res.writeHead(405);
				}
				console.log('Uploaded');
				return;
			});
		});
	}
    console.log(req.url);
    let url = decodeURI(req.url);
    console.log(ROOT_PATH + url);
    //if (!fs.existsSync(ROOT_PATH + url)) {    }

    let path = ROOT_PATH + url;
    let tree = dirTree(path);
    if (tree && tree.children) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('\uFEFF');
        res.write('<h1>' + url.slice(1) + '</h1>');

        let dirHTML = '';
        let fileHTML = '';
        tree.children.forEach((child) => {
            //TEST
            //if (/\.js$/i.test(child.name) || /\.txt$/i.test(child.name))
            //    return;

            if (child.type == 'directory') {
                dirHTML += '<div><a href="' + encodeURI(child.path.slice(sliceLength)) + '">📁 ' + child.name + '</a></div>';
            } else {
                fileHTML += '<div><a href="' + encodeURI(child.path.slice(sliceLength)) + '">📑 ' + child.name + '</a></div>';
            }
        });
        res.write(dirHTML);
        res.write(fileHTML);
		res.write('<form action="' + url + '" method="post" enctype="multipart/form-data">');
		res.write('<input type="file" name="fileToUpload"><br>');
		res.write('<input type="submit" value="Upload">');
		res.write('</form>');
        res.end();
	//} 	else if (/\/play$/i.test(url)) {
		//	res.writeHead(200, { 'Content-Type': 'text/html' });
		//	res.end('<video autoplay><source src="' + req.url.slice(0, req.url.length - 5) + '"></video>');
	}else if (tree && !tree.children) {
        //file	
		let file = fs.createReadStream(ROOT_PATH + url);
		file.pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end('<h1>404 Not Found</h1>');
    }
}).listen(PORT, () => {
    console.log('Directory tree "' + ROOT_PATH + '" is sharing on port ' + PORT);
});