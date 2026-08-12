const CommitteeCard = {

    create(committee) {

        const occupancy =
            Math.round(
                (committee.seatsFilled / committee.totalSeats) * 100
            );

        return `

        <article class="committee-card">

            <div class="committee-category">

                <i class="fa-solid fa-building-columns"></i>

                <span>${committee.category}</span>

            </div>

            <h2 class="committee-title">

                ${committee.name}

            </h2>

            <div class="committee-meta">

                <div>

                    <i class="fa-solid fa-user-tie"></i>

                    ${committee.chairperson}

                </div>

                <div>

                    <i class="fa-solid fa-location-dot"></i>

                    ${committee.venue}

                </div>

                <div>

                    <i class="fa-solid fa-laptop"></i>

                    ${committee.mode}

                </div>

            </div>

            <div class="committee-progress">

                <div class="progress-header">

                    <span>Occupancy</span>

                    <span>

                        ${committee.seatsFilled}
                        /
                        ${committee.totalSeats}

                    </span>

                </div>

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width:${occupancy}%">

                    </div>

                </div>

            </div>

            <button
                class="committee-btn"
                data-id="${committee.id}">

                View Details

            </button>

        </article>

        `;

    }

};