import styles from './ProjectPayoutPolicy.module.scss';

type PayoutPolicy = keyof typeof policies;

interface Props {
  payoutPolicy?: PayoutPolicy;
}

const policies = {
  allOrNothing: {
    title: 'all or nothing',
    description: 'This project will only be funded if it reaches its goal.',
  },
};

const ProjectPayoutPolicy = ({ payoutPolicy = 'allOrNothing' }: Props) => {
  return (
    <div className={styles.payoutPolicy}>
      <h6 className={styles.title}>{policies[payoutPolicy].title}</h6>
      <p className={styles.description}>{policies[payoutPolicy].description}</p>
    </div>
  );
};

export default ProjectPayoutPolicy;
