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
  id: number,
  name: string,
  createdAt: Date,
  imgPath: string,
  username: string,
  isPublic: boolean,
  isAnimated: boolean,
}

export type AnimationSceneResponse = {
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
      scenes: Array<AnimationSceneData>,
    }
  }
}

export type AnimationSceneData = {
  id: number,
  name: string,
  createdAt: Date,
  imgPath: string,
  username: string,
  duration: number,
  isPublic: boolean,
}
