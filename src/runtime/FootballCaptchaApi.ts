import { type MandeInstance, mande } from 'mande'
import { utf8ToUint8Array } from 'pack-bytes-to-utf8'
import { dataDividerChar, shapeFields } from './constants/footballCaptcha'

export class FootballCaptchaApi {
  private api: MandeInstance

  constructor(basePath: string = '/') {
    this.api = mande(basePath)
  }

  setApi(api: string) {
    this.api = mande(api)
  }

    public async loadCaptcha() {
        const result = await this.api.get({
            headers: {
                Accept: 'text/html',
            },
            responseAs: 'text',
        })
        const [idBin, shapesBin, description, imageBin] = result.split(dataDividerChar)
        const shapesData = new Uint16Array(utf8ToUint8Array(shapesBin).buffer)
        const shapes = []

        for (let shapeIndex = 0; shapeIndex < shapesData.length; shapeIndex += shapeFields.length) {
            const shape: Record<string, number> = {}
            for (let fieldIndex = 0; fieldIndex < shapeFields.length; fieldIndex++) {
                const fieldName = shapeFields[fieldIndex];

                shape[fieldName] = shapesData[shapeIndex + fieldIndex];
            }

            shapes.push(shape)
        }

        const imageBlob = new Blob([utf8ToUint8Array(imageBin)]);
        const imageSrc = URL.createObjectURL(imageBlob);
        const image = document.createElement('img');
        image.src = imageSrc

        return {
            description,
            id: idBin,
            shapes: shapes,
            image,
        };
    };

    public async checkResult(id: string, solution: string) {
        const result = await this.api.post(
            '',
            [id, solution].join(dataDividerChar),
            {
                headers: {
                    'Content-Type': 'text/html',
                },
                stringify: (v) => v as string
            }
        )

        console.log(result)

        return result
    }
}
