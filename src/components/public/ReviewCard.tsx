import { TestimonialCard } from "@/components/ui/luxury";

interface ReviewCardProps {
  review: {
    id: string;
    name: string;
    rating: number;
    comment: string;
    service: string | null;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <TestimonialCard
      name={review.name}
      rating={review.rating}
      comment={review.comment}
      service={review.service}
    />
  );
}
