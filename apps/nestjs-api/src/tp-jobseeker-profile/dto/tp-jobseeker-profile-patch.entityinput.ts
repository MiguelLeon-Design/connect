import { InputType, PartialType, PickType } from '@nestjs/graphql'
import { TpJobseekerProfileEntityProps } from '@talent-connect/common-types'

@InputType({ isAbstract: true })
class _TpJobseekerProfileEntityProps extends TpJobseekerProfileEntityProps {}

@InputType('TpJobseekerProfilePatchInput')
export class TpJobseekerProfilePatchInput extends PartialType(
  PickType(_TpJobseekerProfileEntityProps, [
    'aboutYourself',
    'availability',
    'desiredEmploymentType',
    'desiredPositions',
    'federalState',
    'ifAvailabilityIsDate_date',
    'isHired',
    'isJobFair2022Participant',
    'isJobFair2023Participant',
    'joinsBerlin23SummerJobFair',
    'joinsMunich23SummerJobFair',
    'isProfileVisibleToCompanies',
    'location',
    'profileAvatarImageS3Key',
    'rediLocation',
    'state',
    'topSkills',
    'willingToRelocate',
    'immigrationStatus',
  ] as const)
) {}
