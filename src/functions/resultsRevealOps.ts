import Reviews from "@/types/interface/reviews";
import AveragedReviews from "@/types/interface/averagedReviews";
import ReviewWeighting from "@/types/interface/reviewWeighting";
import AveragedCourses from "@/types/interface/averagedCourses";

export function averagingIndiviualReviews<T>(reviews: Reviews[], weighting: ReviewWeighting): AveragedReviews[] {
    const averagedReviews: AveragedReviews[] = [];

    reviews.forEach((review) => {
        const entreeWeighted = review.entreeRating*weighting.entreeWeighting
        const mainWeighted = review.mainRating*weighting.mainWeighting
        const dessertWeighted = review.dessertRating*weighting.dessertWeighting

        const newTotal = entreeWeighted + mainWeighted + dessertWeighted
        const averagedReview: AveragedReviews = {
            id: review.id,
            name: review.name,
            cook: review.cook,
            overallRating: newTotal,
            date: review.date,
            weekNumber: review.weekNumber
        }

        averagedReviews.push(averagedReview)
    })
    return averagedReviews;
}

// Need to look over here because its averaging everything not just b


export function averagingAveraged<T>(averagedReviews: AveragedReviews[]): number {
    let overallAverage = 0;
    let rollingTotal = 0
    averagedReviews.forEach((review) => {
        const avgNumber = review.overallRating
        rollingTotal += avgNumber
    })
    overallAverage = rollingTotal/(averagedReviews.length)

    return overallAverage;
}

export function averageCourses<T>(reviews: Reviews[]): AveragedCourses {
    let entreeTotal = 0
    let mainTotal = 0
    let dessertTotal = 0
    reviews.forEach((review) => {
        entreeTotal += review.entreeRating
        mainTotal += review.mainRating
        dessertTotal += review.dessertRating
    })

    const averagedCourses: AveragedCourses = {
        entreeAvg: entreeTotal/(reviews.length),
        mainAvg: mainTotal/(reviews.length),
        dessertAvg: dessertTotal/(reviews.length),
    }
    

    return averagedCourses;
}