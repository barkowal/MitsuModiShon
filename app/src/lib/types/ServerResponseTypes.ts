export type ResponseError = {
  success: boolean,
  error: string,
}

export type SuccessfullResponse = {
  success: boolean,
  message: string,
  data?: object,
}

export type LoginResponseType = {
  success: boolean,
  message: string,
  data: {
    username: string
  }
}

export type MitsuShortObjectResponse = {
  success: boolean,
  message: string,
  data: {
    result: {
      pageData: {
        prevPage: number,
        nextPage: number,
        lastPage: number,
        limit: number,
      },
      objects: Array<MitsuShortObjectData>,
    }
  }
}

export type MitsuShortObjectData = {
  name: string,
  createdAt: Date,
  imgPath: string,
  username: string,
}
