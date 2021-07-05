import { API_URL } from '@talent-connect/shared-config'
import {
  AccessToken,
  RedUser,
  TpCompanyProfile,
  TpJobListing,
  TpJobseekerProfile,
} from '@talent-connect/shared-types'
import axios from 'axios'
import { QueryClient } from 'react-query'
import {
  getAccessTokenFromLocalStorage,
  purgeAllSessionData,
  saveAccessTokenToLocalStorage,
  saveRedUserToLocalStorage,
} from '../auth/auth'
import { history } from '../history/history'
import { http } from '../http/http'

export const queryClient = new QueryClient()

export const signUpJobseeker = async (
  email: string,
  password: string,
  tpJobseekerProfile: Partial<TpJobseekerProfile>
) => {
  console.log('sign up')
  const userResponse = await http(`${API_URL}/redUsers`, {
    method: 'post',
    data: { email, password },
  })
  const user = userResponse.data as RedUser
  saveRedUserToLocalStorage(user)
  const accessToken = await login(email, password)
  saveAccessTokenToLocalStorage(accessToken)
  const createProfileResponse = await http(
    `${API_URL}/redUsers/${user.id}/tpJobseekerProfile`,
    {
      method: 'post',
      data: tpJobseekerProfile,
      headers: {
        Authorization: accessToken.id,
      },
    }
  )
}

export const signUpCompany = async (
  email: string,
  password: string,
  tpCompanyProfile: Partial<TpCompanyProfile>
) => {
  console.log('sign up')
  const userResponse = await http(`${API_URL}/redUsers`, {
    method: 'post',
    data: { email, password },
  })
  const user = userResponse.data as RedUser
  saveRedUserToLocalStorage(user)
  const accessToken = await login(email, password)
  saveAccessTokenToLocalStorage(accessToken)
  const createProfileResponse = await http(
    `${API_URL}/redUsers/${user.id}/tpCompanyProfile`,
    {
      method: 'post',
      data: tpCompanyProfile,
      headers: {
        Authorization: accessToken.id,
      },
    }
  )
}

export const login = async (
  email: string,
  password: string
): Promise<AccessToken> => {
  const loginResp = await http(`${API_URL}/redUsers/login`, {
    method: 'post',
    data: { email, password },
    headers: {
      RedProduct: 'TP',
    },
  })
  const accessToken = loginResp.data as AccessToken
  return accessToken
}

export const logout = () => {
  purgeAllSessionData()
  history.push('/front/home')
}

export const requestResetPasswordEmail = async (email: string) => {
  await axios(`${API_URL}/redUsers/requestResetPasswordEmail`, {
    method: 'post',
    data: { email, redproduct: 'TP' },
  })
}

export const setPassword = async (password: string) => {
  const userId = getAccessTokenFromLocalStorage().userId
  await http(`${API_URL}/redUsers/${userId}`, {
    method: 'patch',
    data: { password },
  })
}

export async function fetchCurrentUserTpJobseekerProfile(): Promise<
  Partial<TpJobseekerProfile>
> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpJobseekerProfile`)
  return resp.data
}

export async function updateCurrentUserTpJobseekerProfile(
  profile: Partial<TpJobseekerProfile>
): Promise<Partial<TpJobseekerProfile>> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpJobseekerProfile`, {
    method: 'put',
    data: profile,
  })
  return resp.data
}

export async function fetchCurrentUserTpCompanyProfile(): Promise<
  Partial<TpCompanyProfile>
> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpCompanyProfile`)
  return resp.data
}

export async function updateCurrentUserTpCompanyProfile(
  profile: Partial<TpCompanyProfile>
): Promise<Partial<TpCompanyProfile>> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpCompanyProfile`, {
    method: 'put',
    data: profile,
  })
  return resp.data
}

export async function fetchAllTpJobListings(): Promise<Array<TpJobListing>> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpJobListings`)

  // TODO: remove the `.filter()`. It
  // was inserted temporarily for the "dummy" job listings we created for HR Summit
  // 2021. Once the event is over, they can be removed from database completely.
  // Reason for filter here is so companies don't see these dummy job listings.
  return resp.data.filter((listing) => !listing.dummy)
}

export async function fetchOneTpJobListingOfCurrentUser(
  id: string
): Promise<TpJobListing> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpJobListings/${id}`)
  return resp.data
}

export async function fetchOneTpJobListing(id: string): Promise<TpJobListing> {
  const resp = await http(`${API_URL}/tpJobListings/${id}`)
  return resp.data
}

export async function createCurrentUserTpJobListing(
  jobListing: Partial<TpJobListing>
): Promise<Partial<TpJobListing>> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(`${API_URL}/redUsers/${userId}/tpJobListings`, {
    method: 'post',
    data: jobListing,
  })
  return resp.data
}

export async function updateCurrentUserTpJobListing(
  jobListing: Partial<TpJobListing>
): Promise<Partial<TpJobListing>> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(
    `${API_URL}/redUsers/${userId}/tpJobListings/${jobListing.id}`,
    {
      method: 'put',
      data: jobListing,
    }
  )
  return resp.data
}

export async function deleteCurrentUserTpJobListing(
  jobListingId: string
): Promise<Partial<TpJobListing>> {
  const userId = getAccessTokenFromLocalStorage().userId
  const resp = await http(
    `${API_URL}/redUsers/${userId}/tpJobListings/${jobListingId}`,
    {
      method: 'delete',
    }
  )
  return resp.data
}

export async function fetchAllTpJobFair2021InterviewMatches_tpJobListings(): Promise<
  Array<TpJobListing>
> {
  const resp = await http(`${API_URL}/tpJobfair2021InterviewMatches`)
  const interviewMatches = resp.data
  const jobListings: Array<TpJobListing> = interviewMatches.map(
    (match) => match.jobListing
  )

  return jobListings
}

export async function fetchAllTpJobFair2021InterviewMatches_tpJobseekerProfiles(): Promise<
  Array<TpJobseekerProfile>
> {
  const resp = await http(`${API_URL}/tpJobfair2021InterviewMatches`)
  const interviewMatches = resp.data
  const jobseekerProfiles: Array<TpJobseekerProfile> = interviewMatches.map(
    (match) => match.interviewee
  )

  return jobseekerProfiles
}

export async function fetchTpJobseekerProfileById(
  id: string
): Promise<Partial<TpJobseekerProfile>> {
  const resp = await http(`${API_URL}/tpJobseekerProfiles/${id}`)
  return resp.data
}
