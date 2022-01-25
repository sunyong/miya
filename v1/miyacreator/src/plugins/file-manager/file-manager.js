import { exporter } from './exporter';
import { loader } from './loader';
import { AbstractPlugin } from '../../core/plugin.abstract';

export class FileManager extends AbstractPlugin {
  static meta = {
    name: 'file-manager',
  };

  constructor(configs) {
    super(configs);

    const menuItems = document.querySelectorAll('.plugin-file-manager');
    menuItems.forEach((item) => {
      item.addEventListener('click', (event) => this.dispatchEvent(event, item.dataset.event));
    });

    this.fakeLink = document.createElement('a');
    this.fakeLink.style.display = 'none';
    document.body.appendChild(this.fakeLink);

    this.fakeInput = document.createElement('input');
    this.fakeInput.type = 'file';
    this.fakeInput.accept = '.vxl';
    this.fakeInput.style.display = 'none';
    document.body.appendChild(this.fakeInput);

    this.fakeInput.addEventListener('change', (event) => this.fileSelected(event));
  }

  dispatchEvent(event, eventName) {
    switch (eventName) {
      case 'new':
        this.handleNew();
        break;
      case 'save':
        this.handleSave();
        break;
      case 'open':
        this.handleOpen();
        break;
      case 'upload':
        this.handleUpload();
	break;
      default:
        break;
    }
  }

  clearScene() {
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    scene.remove(...sceneObjects);
    sceneObjects.splice(0, sceneObjects.length);
  }

  handleNew() {
    if (window.confirm('Are you sure you want to create a new file?')) {
      this.clearScene();
      this.configs.render();
    }
  }

  handleSave() {
    const data = exporter(this.configs.sceneObjects);

    const output = JSON.stringify(data, null, 2);
    console.log(output);
    this.fakeLink.href = URL.createObjectURL(new Blob([output], { type: 'text/plain' }));
    this.fakeLink.download = 'scene.vxl';
    this.fakeLink.click();
  }
  handleUpload() {
    const data = exporter(this.configs.sceneObjects);
    const output = JSON.stringify(data, null, 2);
    const path = 'http://10.157.15.19:5780/voxelPost';
    this.sendData(path, {formdata: output});
/*    const form = document.createElement('form');
    form.method = 'POST';
    form.action = path;
    console.log(output);
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'obj';
    hiddenField.value = output;
    form.appendChild(hiddenField);
    document.body.appendChild(form);
    form.submit();*/
	

//    const url = "http://10.157.15.19:5780/voxelPost";
//    location.href = url;
/*    const Http = new XMLHttpRequest();
    const url = "http://10.157.15.19:5780/voxelPost";
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
      console.log(Http.responseText)
    }
*/


/*    let f = document.createElement('form');
    let obj;
//    obj.setAttribute('type', 'hidden');
//    obj.setAttribute('name', 'userid');
//    obj.setAttribute('value', userid);
    f.appendChild(obj);
    f.setAttribute('method', 'post');
    f.setAttribute('action', 'view.do');
    document.body.appendChild(f);
    f.submit();
    */
  }

  sendData(path, parameters, method='post') {

    const form = document.createElement('form');
    form.method = method;
    form.action = path;
    document.body.appendChild(form);

    for (const key in parameters) {
        const formField = document.createElement('input');
        formField.type = 'hidden';
        formField.name = key;
        formField.value = parameters[key];

        form.appendChild(formField);
    }
    form.submit();
  }

  handleOpen() {
    this.fakeInput.click();
  }

  fileSelected(event) {
    const { files } = event.target;
    const { THREE } = this.configs;
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    if (files && files.length) {
      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = () => {
        this.clearScene();

        const data = loader(THREE, reader.result);
        data.forEach((voxel) => {
          scene.add(voxel);
          sceneObjects.push(voxel);
        });

        this.configs.render();
      };
    }

    event.target.value = null;
  }
}
